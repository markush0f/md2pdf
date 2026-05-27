use crate::{parse_markdown, LayoutDocument, MarkdownDocument, MarkdownError};

#[derive(Debug, Default, Clone, Copy)]
pub struct MarkdownEngine;

impl MarkdownEngine {
    pub fn new() -> Self {
        Self
    }

    pub fn read(&self, markdown: &str) -> Result<MarkdownDocument, MarkdownError> {
        parse_markdown(markdown)
    }

    pub fn read_source(&self, markdown: &str) -> Result<String, MarkdownError> {
        Ok(self.read(markdown)?.source)
    }

    pub fn compile(&self, markdown: &str) -> Result<LayoutDocument, MarkdownError> {
        Ok(self.read(markdown)?.layout)
    }
}
