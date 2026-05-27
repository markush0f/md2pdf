use markdown_to_pdf_core::MarkdownEngine;
use markdown_to_pdf_renderer::PdfRenderer;

#[test]
fn renders_layout_document_to_pdf_bytes() {
    let layout = MarkdownEngine::new().compile("# Title\n\nBody").unwrap();
    let pdf = PdfRenderer::new().render(&layout);
    let output = String::from_utf8(pdf).unwrap();

    assert!(output.starts_with("%PDF-1.4"));
    assert!(output.contains("% text x=40 y=40 size=24: Title"));
    assert!(output.ends_with("%%EOF\n"));
}
