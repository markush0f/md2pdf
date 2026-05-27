use markdown_to_pdf_core::{LayoutDocument, LayoutElement};

#[derive(Debug, Default, Clone, Copy)]
pub struct PdfRenderer;

impl PdfRenderer {
    pub fn new() -> Self {
        Self
    }

    pub fn render(&self, document: &LayoutDocument) -> Vec<u8> {
        let mut output = String::from("%PDF-1.4\n");
        output.push_str("% markdown-to-pdf layout preview\n");

        for page in &document.pages {
            output.push_str(&format!("% Page {}\n", page.number));

            for element in &page.elements {
                match element {
                    LayoutElement::Text {
                        x,
                        y,
                        font_size,
                        content,
                    } => output.push_str(&format!(
                        "% text x={x} y={y} size={font_size}: {}\n",
                        escape_pdf_comment(content)
                    )),
                    LayoutElement::Code { x, y, content } => output.push_str(&format!(
                        "% code x={x} y={y}: {}\n",
                        escape_pdf_comment(content)
                    )),
                }
            }
        }

        output.push_str("%%EOF\n");
        output.into_bytes()
    }
}

fn escape_pdf_comment(input: &str) -> String {
    input.replace('\n', "\\n").replace('\r', "")
}
