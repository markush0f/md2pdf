#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MarkdownDocument {
    pub source: String,
    pub html: String,
    pub title: Option<String>,
}
