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
    assert!(output.contains("/BaseFont /Helvetica-Bold"));
    assert!(output.contains("/BaseFont /Courier"));
    assert!(output.contains("0.10 0.18 0.30 rg"));
    assert!(output.contains("BT /F2 28 Tf 56 778 Td (Title) Tj ET"));
    assert!(output.contains("xref"));
    assert!(output.contains("trailer"));
    assert!(output.contains("startxref"));
    assert!(output.ends_with("%%EOF\n"));
}

#[test]
fn renders_multiple_pdf_pages() {
    let markdown = (1..=40)
        .map(|index| format!("Paragraph {index}"))
        .collect::<Vec<_>>()
        .join("\n\n");
    let layout = MarkdownEngine::new().compile(&markdown).unwrap();
    let pdf = PdfRenderer::new().render(&layout);
    let output = String::from_utf8(pdf).unwrap();

    assert!(layout.pages.len() > 1);
    assert!(output.contains("/Count 2"));
    assert_eq!(output.matches("/Type /Page /Parent").count(), 2);
    assert!(output.contains("BT /F1 12 Tf 56 778 Td (Paragraph 26) Tj ET"));
}
