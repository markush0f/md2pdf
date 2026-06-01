use markdown_to_pdf_core::{MarkdownEngine, PdfStyle, PdfTheme};
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
    assert!(output.contains("1 1 1 rg\n0 0 595 842 re f"));
    assert!(output.contains("0.1 0.18 0.3 rg"));
    assert!(output.contains("BT /F2 30 Tf 48 794 Td (Title) Tj ET"));
    assert!(output.contains("0.82 0.85 0.9 RG\n0.75 w\n48 783.5 m 547 783.5 l S"));
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
    assert!(output.contains("BT /F1 12 Tf 48 794 Td (Paragraph 25) Tj ET"));
}

#[test]
fn renders_dark_theme_colors() {
    let layout = MarkdownEngine::new().compile("# Title\n\nBody").unwrap();
    let pdf = PdfRenderer::with_style(PdfStyle::for_theme(PdfTheme::Dark)).render(&layout);
    let output = String::from_utf8(pdf).unwrap();

    assert!(output.contains("0.07 0.09 0.13 rg\n0 0 595 842 re f"));
    assert!(output.contains("0.96 0.98 1 rg"));
    assert!(output.contains("0.84 0.88 0.95 rg"));
}

#[test]
fn renders_with_structural_values_from_toml() {
    let style = PdfStyle::from_toml(
        r#"
        [page]
        size = "A4"
        margin = 72

        [code_block]
        font_size = 9
        line_height = 11
        padding = 16
        margin_top = 8
        margin_bottom = 14
        "#,
    );
    let layout = markdown_to_pdf_core::LayoutEngine::with_style(style.clone())
        .layout(&MarkdownEngine::new().read("```bash\nls\n```").unwrap().ast);
    let pdf = PdfRenderer::with_style(style).render(&layout);
    let output = String::from_utf8(pdf).unwrap();

    assert!(output.contains("72 727 451 43 re f"));
    assert!(output.contains("BT /F3 9 Tf 88 745 Td (ls) Tj ET"));
}
