use crate::{MarkdownAst, MarkdownBlock};

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
        let mut y = 40.0;
        let elements = ast
            .blocks
            .iter()
            .flat_map(|block| layout_block(block, &mut y))
            .collect();

        LayoutDocument {
            pages: vec![LayoutPage {
                number: 1,
                elements,
            }],
        }
    }
}

fn layout_block(block: &MarkdownBlock, y: &mut f32) -> Vec<LayoutElement> {
    match block {
        MarkdownBlock::Heading { level, text } => {
            let font_size = match level {
                1 => 24.0,
                2 => 20.0,
                _ => 16.0,
            };
            let element = LayoutElement::Text {
                x: 40.0,
                y: *y,
                font_size,
                content: text.clone(),
            };
            *y += font_size + 12.0;
            vec![element]
        }
        MarkdownBlock::Paragraph(text) => {
            let element = LayoutElement::Text {
                x: 40.0,
                y: *y,
                font_size: 12.0,
                content: text.clone(),
            };
            *y += 24.0;
            vec![element]
        }
        MarkdownBlock::CodeBlock { code, .. } => {
            let element = LayoutElement::Code {
                x: 40.0,
                y: *y,
                content: code.clone(),
            };
            *y += 32.0;
            vec![element]
        }
        MarkdownBlock::List(items) => items
            .iter()
            .map(|item| {
                let element = LayoutElement::Text {
                    x: 52.0,
                    y: *y,
                    font_size: 12.0,
                    content: format!("- {item}"),
                };
                *y += 18.0;
                element
            })
            .collect(),
    }
}
