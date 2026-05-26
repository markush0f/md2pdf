mod document;
mod error;
mod parser;

pub use document::MarkdownDocument;
pub use error::MarkdownError;
pub use parser::parse_markdown;
