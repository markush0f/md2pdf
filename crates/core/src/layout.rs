use crate::{MarkdownAst, MarkdownBlock};

const PAGE_MARGIN_X: f32 = 56.0;
const PAGE_MARGIN_TOP: f32 = 64.0;
const PAGE_HEIGHT: f32 = 842.0;
const PAGE_MARGIN_BOTTOM: f32 = 64.0;
const CONTENT_BOTTOM: f32 = PAGE_HEIGHT - PAGE_MARGIN_BOTTOM;
const CODE_LINE_HEIGHT: f32 = 13.0;

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

#[derive(Debug, Default, Clone, Copy)]
pub struct LayoutEngine;

impl LayoutEngine {
    pub fn new() -> Self {
        Self
    }

    pub fn layout(&self, ast: &MarkdownAst) -> LayoutDocument {
        let mut pages = Vec::new();
        let mut elements = Vec::new();
        let mut y = PAGE_MARGIN_TOP;

        for block in &ast.blocks {
            if !elements.is_empty() && y + block_height(block) > CONTENT_BOTTOM {
                pages.push(LayoutPage {
                    number: pages.len() + 1,
                    elements,
                });
                elements = Vec::new();
                y = PAGE_MARGIN_TOP;
            }

            elements.extend(layout_block(block, &mut y));
        }

        pages.push(LayoutPage {
            number: pages.len() + 1,
            elements,
        });

        LayoutDocument { pages }
    }
}

fn block_height(block: &MarkdownBlock) -> f32 {
    match block {
        MarkdownBlock::Heading { level, .. } => heading_font_size(*level) + 16.0,
        MarkdownBlock::Paragraph(_) => 28.0,
        MarkdownBlock::CodeBlock { code, .. } => {
            code.lines().count().max(1) as f32 * CODE_LINE_HEIGHT + 24.0
        }
        MarkdownBlock::List(items) => items.len() as f32 * 20.0,
    }
}

fn heading_font_size(level: u8) -> f32 {
    match level {
        1 => 28.0,
        2 => 21.0,
        _ => 16.0,
    }
}

fn layout_block(block: &MarkdownBlock, y: &mut f32) -> Vec<LayoutElement> {
    match block {
        MarkdownBlock::Heading { level, text } => {
            let font_size = heading_font_size(*level);
            let element = LayoutElement::Text {
                x: PAGE_MARGIN_X,
                y: *y,
                font_size,
                content: text.clone(),
            };
            *y += font_size + 16.0;
            vec![element]
        }
        MarkdownBlock::Paragraph(text) => {
            let element = LayoutElement::Text {
                x: PAGE_MARGIN_X,
                y: *y,
                font_size: 12.0,
                content: text.clone(),
            };
            *y += 28.0;
            vec![element]
        }
        MarkdownBlock::CodeBlock { code, .. } => {
            let element = LayoutElement::Code {
                x: PAGE_MARGIN_X,
                y: *y,
                content: code.clone(),
            };
            *y += code.lines().count().max(1) as f32 * CODE_LINE_HEIGHT + 24.0;
            vec![element]
        }
        MarkdownBlock::List(items) => items
            .iter()
            .map(|item| {
                let element = LayoutElement::Text {
                    x: PAGE_MARGIN_X + 16.0,
                    y: *y,
                    font_size: 12.0,
                    content: format!("- {item}"),
                };
                *y += 20.0;
                element
            })
            .collect(),
    }
}
