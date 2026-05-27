#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MarkdownAst {
    pub blocks: Vec<MarkdownBlock>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MarkdownBlock {
    Heading { level: u8, text: String },
    Paragraph(String),
    CodeBlock { language: Option<String>, code: String },
    List(Vec<String>),
}
