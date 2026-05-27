use crate::{LayoutDocument, MarkdownAst};

#[derive(Debug, Clone, PartialEq)]
pub struct MarkdownDocument {
    pub source: String,
    pub html: String,
    pub title: Option<String>,
    pub ast: MarkdownAst,
    pub layout: LayoutDocument,
}
