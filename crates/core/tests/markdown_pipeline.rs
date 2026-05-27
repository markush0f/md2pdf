use markdown_to_pdf_core::{LayoutElement, MarkdownBlock, MarkdownEngine};
use pretty_assertions::assert_eq;

#[test]
fn builds_ast_from_markdown() {
    let document = MarkdownEngine::new()
        .read("# Title\n\nA paragraph\n\n- One\n- Two")
        .unwrap();

    assert_eq!(
        document.ast.blocks,
        vec![
            MarkdownBlock::Heading {
                level: 1,
                text: "Title".to_string(),
            },
            MarkdownBlock::Paragraph("A paragraph".to_string()),
            MarkdownBlock::List(vec!["One".to_string(), "Two".to_string()]),
        ]
    );
}

#[test]
fn builds_layout_from_ast() {
    let layout = MarkdownEngine::new()
        .compile("# Title\n\nA paragraph")
        .unwrap();

    assert_eq!(layout.pages.len(), 1);
    assert_eq!(layout.pages[0].number, 1);
    assert_eq!(
        layout.pages[0].elements[0],
        LayoutElement::Text {
            x: 56.0,
            y: 64.0,
            font_size: 28.0,
            content: "Title".to_string(),
        }
    );
}

#[test]
fn paginates_long_documents() {
    let markdown = (1..=40)
        .map(|index| format!("Paragraph {index}"))
        .collect::<Vec<_>>()
        .join("\n\n");
    let layout = MarkdownEngine::new().compile(&markdown).unwrap();

    assert!(layout.pages.len() > 1);
    assert_eq!(layout.pages[0].number, 1);
    assert_eq!(layout.pages[1].number, 2);
    assert_eq!(
        layout.pages[1].elements[0],
        LayoutElement::Text {
            x: 56.0,
            y: 64.0,
            font_size: 12.0,
            content: "Paragraph 26".to_string(),
        }
    );
}
