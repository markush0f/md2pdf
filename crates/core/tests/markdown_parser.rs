use markdown_to_pdf_core::{parse_markdown, MarkdownEngine, MarkdownError};
use pretty_assertions::assert_eq;

#[test]
fn converts_markdown_to_html() {
    let document = parse_markdown("# Hello").unwrap();

    assert_eq!(document.html, "<h1>Hello</h1>\n");
}

#[test]
fn extracts_title_from_h1() {
    let document = parse_markdown("# Hello\n\nBody").unwrap();

    assert_eq!(document.title, Some("Hello".to_string()));
}

#[test]
fn handles_markdown_without_title() {
    let document = parse_markdown("Plain text").unwrap();

    assert_eq!(document.title, None);
}

#[test]
fn keeps_original_source() {
    let source = "# Hello\n\nBody";
    let document = parse_markdown(source).unwrap();

    assert_eq!(document.source, source);
}

#[test]
fn rejects_empty_input() {
    let error = parse_markdown("   \n\t").unwrap_err();

    assert_eq!(error, MarkdownError::EmptyInput);
}

#[test]
fn engine_reads_markdown_and_returns_source() {
    let source = "# Hello\n\nBody";
    let output = MarkdownEngine::new().read_source(source).unwrap();

    assert_eq!(output, source);
}
