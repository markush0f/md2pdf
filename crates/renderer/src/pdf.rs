use markdown_to_pdf_core::{LayoutDocument, LayoutElement};

const PAGE_WIDTH: f32 = 595.0;
const PAGE_HEIGHT: f32 = 842.0;

#[derive(Debug, Default, Clone, Copy)]
pub struct PdfRenderer;

impl PdfRenderer {
    pub fn new() -> Self {
        Self
    }

    pub fn render(&self, document: &LayoutDocument) -> Vec<u8> {
        let page_count = document.pages.len().max(1);
        let font_id = 3 + page_count * 2;
        let mut objects = Vec::new();

        let kids = (0..page_count)
            .map(|index| format!("{} 0 R", 3 + index * 2))
            .collect::<Vec<_>>()
            .join(" ");

        objects.push("<< /Type /Catalog /Pages 2 0 R >>".to_string());
        objects.push(format!(
            "<< /Type /Pages /Kids [{}] /Count {} >>",
            kids, page_count
        ));

        for index in 0..page_count {
            let page_id = 3 + index * 2;
            let content_id = page_id + 1;
            objects.push(format!(
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] /Resources << /Font << /F1 {font_id} 0 R >> >> /Contents {content_id} 0 R >>"
            ));

            let content = document
                .pages
                .get(index)
                .map(render_page_content)
                .unwrap_or_default();
            objects.push(format!(
                "<< /Length {} >>\nstream\n{}endstream",
                content.len(),
                content
            ));
        }

        objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>".to_string());

        build_pdf(objects)
    }
}

fn render_page_content(page: &markdown_to_pdf_core::LayoutPage) -> String {
    let mut content = String::new();

    for element in &page.elements {
        match element {
            LayoutElement::Text {
                x,
                y,
                font_size,
                content: text,
            } => push_text(&mut content, *x, *y, *font_size, text),
            LayoutElement::Code { x, y, content: code } => {
                for (line_index, line) in code.lines().enumerate() {
                    push_text(&mut content, *x, *y + line_index as f32 * 12.0, 10.0, line);
                }
            }
        }
    }

    content
}

fn push_text(content: &mut String, x: f32, y: f32, font_size: f32, text: &str) {
    let pdf_y = PAGE_HEIGHT - y;
    content.push_str(&format!(
        "BT /F1 {font_size} Tf {x} {pdf_y} Td ({}) Tj ET\n",
        escape_pdf_string(text)
    ));
}

fn escape_pdf_string(input: &str) -> String {
    input
        .replace('\\', "\\\\")
        .replace('(', "\\(")
        .replace(')', "\\)")
        .replace('\r', "")
        .replace('\n', "\\n")
}

fn build_pdf(objects: Vec<String>) -> Vec<u8> {
    let mut output = Vec::new();
    let mut offsets = Vec::with_capacity(objects.len());

    output.extend_from_slice(b"%PDF-1.4\n");

    for (index, object) in objects.iter().enumerate() {
        offsets.push(output.len());
        output.extend_from_slice(format!("{} 0 obj\n{}\nendobj\n", index + 1, object).as_bytes());
    }

    let xref_offset = output.len();
    output.extend_from_slice(format!("xref\n0 {}\n", objects.len() + 1).as_bytes());
    output.extend_from_slice(b"0000000000 65535 f \n");

    for offset in offsets {
        output.extend_from_slice(format!("{offset:010} 00000 n \n").as_bytes());
    }

    output.extend_from_slice(
        format!(
            "trailer\n<< /Size {} /Root 1 0 R >>\nstartxref\n{}\n%%EOF\n",
            objects.len() + 1,
            xref_offset
        )
        .as_bytes(),
    );

    output
}
