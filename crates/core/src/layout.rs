use crate::{MarkdownAst, MarkdownBlock, PdfStyle};

#[derive(Debug, Clone, PartialEq)]
pub struct LayoutDocument {
    pub pages: Vec<LayoutPage>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct LayoutPage {
    pub number: usize,
    pub elements: Vec<LayoutElement>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum LayoutElement {
    Text {
        x: f32,
        y: f32,
        font_size: f32,
        content: String,
    },
    Code {
        x: f32,
        y: f32,
        content: String,
    },
}

#[derive(Debug, Clone)]
pub struct LayoutEngine {
    style: PdfStyle,
}

impl LayoutEngine {
    pub fn new() -> Self {
        Self {
            style: PdfStyle::default(),
        }
    }

    pub fn with_style(style: PdfStyle) -> Self {
        Self { style }
    }

    pub fn layout(&self, ast: &MarkdownAst) -> LayoutDocument {
        let mut pages = Vec::new();
        let mut elements = Vec::new();
        let mut y = self.style.page.margin;
        let content_bottom = self.style.page.height - self.style.page.margin;

        for block in &ast.blocks {
            let mut top_spacing = block_top_spacing(block, !elements.is_empty(), &self.style);

            if !elements.is_empty()
                && y + top_spacing + block_height(block, &self.style) > content_bottom
            {
                pages.push(LayoutPage {
                    number: pages.len() + 1,
                    elements,
                });
                elements = Vec::new();
                y = self.style.page.margin;
                top_spacing = 0.0;
            }

            y += top_spacing;
            elements.extend(layout_block(block, &mut y, &self.style));
        }

        pages.push(LayoutPage {
            number: pages.len() + 1,
            elements,
        });

        LayoutDocument { pages }
    }
}

impl Default for LayoutEngine {
    fn default() -> Self {
        Self::new()
    }
}

fn block_top_spacing(block: &MarkdownBlock, has_previous_element: bool, style: &PdfStyle) -> f32 {
    match block {
        MarkdownBlock::Heading { .. } if has_previous_element => style.heading.margin_top,
        MarkdownBlock::CodeBlock { .. } if has_previous_element => style.code_block.margin_top,
        _ => 0.0,
    }
}

fn block_height(block: &MarkdownBlock, style: &PdfStyle) -> f32 {
    match block {
        MarkdownBlock::Heading { level, .. } => {
            let heading = heading_style(*level, style);
            wrapped_line_count(block_text(block), heading.font_size, usable_width(style)) as f32
                * text_line_height(heading.font_size)
                + heading.margin_bottom
        }
        MarkdownBlock::Paragraph(text) => {
            wrapped_line_count(text, style.body.font_size, usable_width(style)) as f32
                * body_line_height(style)
                + style.body.margin_bottom
        }
        MarkdownBlock::CodeBlock { code, .. } => {
            wrapped_code_line_count(code, style) as f32 * style.code_block.line_height
                + style.code_block.padding * 2.0
                + style.code_block.margin_bottom
        }
        MarkdownBlock::List(items) => {
            items
                .iter()
                .map(|item| {
                    wrapped_line_count(
                        &format!("- {item}"),
                        style.body.font_size,
                        usable_width(style) - 16.0,
                    ) as f32
                        * body_line_height(style)
                })
                .sum::<f32>()
                + style.body.margin_bottom
        }
    }
}

fn heading_style(level: u8, style: &PdfStyle) -> &crate::HeadingLevelStyle {
    match level {
        1 => &style.heading.h1,
        2 => &style.heading.h2,
        _ => &style.heading.h3,
    }
}

fn body_line_height(style: &PdfStyle) -> f32 {
    style.body.font_size * style.body.line_height
}

fn text_line_height(font_size: f32) -> f32 {
    font_size * 1.2
}

fn usable_width(style: &PdfStyle) -> f32 {
    style.page.width - style.page.margin * 2.0
}

fn code_width(style: &PdfStyle) -> f32 {
    (usable_width(style) - style.code_block.padding * 2.0).max(1.0)
}

fn block_text(block: &MarkdownBlock) -> &str {
    match block {
        MarkdownBlock::Heading { text, .. } | MarkdownBlock::Paragraph(text) => text,
        MarkdownBlock::CodeBlock { code, .. } => code,
        MarkdownBlock::List(_) => "",
    }
}

fn wrapped_line_count(text: &str, font_size: f32, max_width: f32) -> usize {
    wrap_text(text, font_size, max_width).len()
}

fn wrapped_code_line_count(code: &str, style: &PdfStyle) -> usize {
    wrap_code(code, style).lines().count().max(1)
}

fn wrap_text(text: &str, font_size: f32, max_width: f32) -> Vec<String> {
    let max_chars = (max_width / average_char_width(font_size)).floor().max(1.0) as usize;
    let mut lines = Vec::new();
    let mut current = String::new();

    for word in text.split_whitespace() {
        if current.is_empty() {
            push_wrapped_word(&mut lines, &mut current, word, max_chars);
        } else if current.len() + 1 + word.len() <= max_chars {
            current.push(' ');
            current.push_str(word);
        } else {
            lines.push(std::mem::take(&mut current));
            push_wrapped_word(&mut lines, &mut current, word, max_chars);
        }
    }

    if !current.is_empty() {
        lines.push(current);
    }

    if lines.is_empty() {
        lines.push(String::new());
    }

    lines
}

fn push_wrapped_word(lines: &mut Vec<String>, current: &mut String, word: &str, max_chars: usize) {
    if word.len() <= max_chars {
        current.push_str(word);
        return;
    }

    let mut chunk = String::new();
    for character in word.chars() {
        chunk.push(character);
        if chunk.len() >= max_chars {
            lines.push(std::mem::take(&mut chunk));
        }
    }
    current.push_str(&chunk);
}

fn wrap_code(code: &str, style: &PdfStyle) -> String {
    let max_chars = (code_width(style) / code_char_width(style.code_block.font_size))
        .floor()
        .max(1.0) as usize;
    let mut wrapped = Vec::new();

    for line in code.lines() {
        wrapped.extend(wrap_code_line(line, max_chars));
    }

    if wrapped.is_empty() {
        return String::new();
    }

    let mut content = wrapped.join("\n");
    if code.ends_with('\n') {
        content.push('\n');
    }
    content
}

fn wrap_code_line(line: &str, max_chars: usize) -> Vec<String> {
    if line.is_empty() {
        return vec![String::new()];
    }

    let mut lines = Vec::new();
    let mut current = String::new();

    for character in line.chars() {
        current.push(character);
        if current.chars().count() >= max_chars {
            lines.push(std::mem::take(&mut current));
        }
    }

    if !current.is_empty() {
        lines.push(current);
    }

    lines
}

fn average_char_width(font_size: f32) -> f32 {
    font_size * 0.52
}

fn code_char_width(font_size: f32) -> f32 {
    font_size * 0.62
}

fn layout_block(block: &MarkdownBlock, y: &mut f32, style: &PdfStyle) -> Vec<LayoutElement> {
    match block {
        MarkdownBlock::Heading { level, text } => {
            let heading = heading_style(*level, style);
            let elements = layout_wrapped_text(
                text,
                style.page.margin,
                y,
                heading.font_size,
                text_line_height(heading.font_size),
                usable_width(style),
            );
            *y += heading.margin_bottom;
            elements
        }
        MarkdownBlock::Paragraph(text) => {
            let elements = layout_wrapped_text(
                text,
                style.page.margin,
                y,
                style.body.font_size,
                body_line_height(style),
                usable_width(style),
            );
            *y += style.body.margin_bottom;
            elements
        }
        MarkdownBlock::CodeBlock { code, .. } => {
            let content = wrap_code(code, style);
            let line_count = content.lines().count().max(1);
            let element = LayoutElement::Code {
                x: style.page.margin,
                y: *y,
                content,
            };
            *y += line_count as f32 * style.code_block.line_height
                + style.code_block.padding * 2.0
                + style.code_block.margin_bottom;
            vec![element]
        }
        MarkdownBlock::List(items) => items
            .iter()
            .flat_map(|item| {
                layout_wrapped_text(
                    &format!("- {item}"),
                    style.page.margin + 16.0,
                    y,
                    style.body.font_size,
                    body_line_height(style),
                    usable_width(style) - 16.0,
                )
            })
            .collect(),
    }
}

fn layout_wrapped_text(
    text: &str,
    x: f32,
    y: &mut f32,
    font_size: f32,
    line_height: f32,
    max_width: f32,
) -> Vec<LayoutElement> {
    wrap_text(text, font_size, max_width)
        .into_iter()
        .map(|content| {
            let element = LayoutElement::Text {
                x,
                y: *y,
                font_size,
                content,
            };
            *y += line_height;
            element
        })
        .collect()
}
