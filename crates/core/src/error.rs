use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum MarkdownError {
    #[error("markdown input is empty")]
    EmptyInput,
}
