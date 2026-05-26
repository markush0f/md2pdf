use crate::{MarkdownDocument, MarkdownError};

pub fn parse_markdown(input: &str) -> Result<MarkdownDocument, MarkdownError> {
    if input.trim().is_empty() {
        return Err(MarkdownError::EmptyInput);
    }

    Ok(MarkdownDocument {
        source: input.to_string(),
        html: comrak::markdown_to_html(input, &comrak::Options::default()),
        title: extract_title(input),
    })
}

fn extract_title(input: &str) -> Option<String> {
    input.lines().find_map(|line| {
        let title = line.strip_prefix("# ")?.trim();

        if title.is_empty() {
            None
        } else {
            Some(title.to_string())
        }
    })
}
