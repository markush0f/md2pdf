use markdown_to_pdf_core::MarkdownEngine;
use markdown_to_pdf_renderer::PdfRenderer;

#[test]
fn renders_layout_document_to_pdf_bytes() {
    let layout = MarkdownEngine::new().compile("# Title\n\nBody").unwrap();
    let pdf = PdfRenderer::new().render(&layout);
    let output = String::from_utf8(pdf).unwrap();

    assert!(output.starts_with("%PDF-1.4"));
    assert!(output.contains("/Type /Catalog"));
    assert!(output.contains("/Type /Pages"));
    assert!(output.contains("/Type /Page"));
    assert!(output.contains("/BaseFont /Helvetica"));
    assert!(output.contains("BT /F1 24 Tf 40 802 Td (Title) Tj ET"));
    assert!(output.contains("xref"));
    assert!(output.contains("trailer"));
    assert!(output.contains("startxref"));
    assert!(output.ends_with("%%EOF\n"));
}
