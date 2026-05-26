pub fn parse_markdown(input: &str) -> String {
    comrak::markdown_to_html(input, &comrak::Options::default())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_markdown() {
        assert_eq!(parse_markdown("# Hello"), "<h1>Hello</h1>\n");
    }
}
