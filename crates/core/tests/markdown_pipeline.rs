use markdown_to_pdf_core::{LayoutElement, LayoutEngine, MarkdownBlock, MarkdownEngine, PdfStyle};
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
            x: 48.0,
            y: 48.0,
            font_size: 30.0,
            content: "Title".to_string(),
        }
    );
}

#[test]
fn keeps_heading_and_code_block_separated() {
    let layout = MarkdownEngine::new()
        .compile("### 1. Central PostgreSQL host\n\n```bash\ncd docker\ncp .env.db.example .env.db\ndocker compose --env-file .env.db -f compose.db.yml up -d\n```")
        .unwrap();

    assert_eq!(layout.pages.len(), 1);
    assert_eq!(
        layout.pages[0].elements[0],
        LayoutElement::Text {
            x: 48.0,
            y: 48.0,
            font_size: 16.0,
            content: "1. Central PostgreSQL host".to_string(),
        }
    );
    assert_eq!(
        layout.pages[0].elements[1],
        LayoutElement::Rule {
            x: 48.0,
            y: 53.599995,
            width: 499.0,
        }
    );
    assert_eq!(
        layout.pages[0].elements[2],
        LayoutElement::Code {
            x: 48.0,
            y: 71.2,
                content: "cd docker\ncp .env.db.example .env.db\ndocker compose --env-file .env.db -f compose.db.yml up -d\n".to_string(),
            }
    );
}

#[test]
fn keeps_paragraph_intro_close_to_following_code_block() {
    let layout = MarkdownEngine::new()
        .compile("Start the Tauri app in another terminal:\n\n```bash\nnpm run tauri dev\n```")
        .unwrap();

    assert_eq!(layout.pages.len(), 1);
    assert_eq!(
        layout.pages[0].elements[0],
        LayoutElement::Text {
            x: 48.0,
            y: 48.0,
            font_size: 12.0,
            content: "Start the Tauri app in another terminal:".to_string(),
        }
    );
    assert_eq!(
        layout.pages[0].elements[1],
        LayoutElement::Code {
            x: 48.0,
            y: 68.0,
            content: "npm run tauri dev\n".to_string(),
        }
    );
}

#[test]
fn headings_have_more_space_before_than_after() {
    let layout = MarkdownEngine::new()
        .compile("Intro paragraph\n\n## Overview\n\nOverview body")
        .unwrap();

    assert_eq!(layout.pages.len(), 1);
    assert_eq!(
        layout.pages[0].elements,
        vec![
            LayoutElement::Text {
                x: 48.0,
                y: 48.0,
                font_size: 12.0,
                content: "Intro paragraph".to_string(),
            },
            LayoutElement::Text {
                x: 48.0,
                y: 106.0,
                font_size: 22.0,
                content: "Overview".to_string(),
            },
            LayoutElement::Rule {
                x: 48.0,
                y: 113.69999,
                width: 499.0,
            },
            LayoutElement::Text {
                x: 48.0,
                y: 134.4,
                font_size: 12.0,
                content: "Overview body".to_string(),
            },
        ]
    );
}

#[test]
fn wraps_paragraphs_to_the_usable_width() {
    let style = PdfStyle::from_toml(
        r#"
        [page]
        size = "A4"
        margin = 250

        [body]
        font_size = 12
        line_height = 1.5
        margin_bottom = 12
        "#,
    );
    let ast = MarkdownEngine::new()
        .read("This paragraph is long enough to wrap inside a narrow content area")
        .unwrap()
        .ast;
    let layout = LayoutEngine::with_style(style).layout(&ast);

    assert_eq!(layout.pages[0].elements.len(), 5);
    assert_eq!(
        layout.pages[0].elements[0],
        LayoutElement::Text {
            x: 250.0,
            y: 250.0,
            font_size: 12.0,
            content: "This paragraph".to_string(),
        }
    );
    assert_eq!(
        layout.pages[0].elements[4],
        LayoutElement::Text {
            x: 250.0,
            y: 322.0,
            font_size: 12.0,
            content: "content area".to_string(),
        }
    );
}

#[test]
fn wraps_long_code_lines_to_the_usable_width() {
    let style = PdfStyle::from_toml(
        r#"
        [page]
        size = "A4"
        margin = 250

        [code_block]
        font_size = 10
        line_height = 13
        padding = 10
        margin_top = 8
        margin_bottom = 12
        "#,
    );
    let ast = MarkdownEngine::new()
        .read(
            r#"```bash
curl "http://iranet-api:8000/servers/server-01/install-command?database_dsn=postgresql%2Basyncpg%3A%2F%2Firanet%3Apass%40db.example.com%3A5432%2Firanet&backend_base_url=http%3A%2F%2F10.0.0.21%3A8000&server_name=Production%2001&environment=production&capabilities=system,processes,services,logs,packages,users,metrics"
```"#,
        )
        .unwrap()
        .ast;
    let layout = LayoutEngine::with_style(style).layout(&ast);
    let LayoutElement::Code { content, .. } = &layout.pages[0].elements[0] else {
        panic!("expected code block");
    };

    assert!(content.lines().count() > 1);
    assert!(content.lines().all(|line| line.chars().count() <= 14));
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
            x: 48.0,
            y: 48.0,
            font_size: 12.0,
            content: "Paragraph 25".to_string(),
        }
    );
}

#[test]
fn keeps_heading_with_following_paragraph_when_paginating() {
    let filler = (1..=23)
        .map(|index| format!("Paragraph {index}"))
        .collect::<Vec<_>>()
        .join("\n\n");
    let markdown =
        format!("{filler}\n\n### Important section\n\nThis paragraph belongs to the heading");
    let layout = MarkdownEngine::new().compile(&markdown).unwrap();

    assert!(layout.pages.len() > 1);
    assert_eq!(
        layout.pages[1].elements[0],
        LayoutElement::Text {
            x: 48.0,
            y: 48.0,
            font_size: 16.0,
            content: "Important section".to_string(),
        }
    );
    assert_eq!(
        layout.pages[1].elements[1],
        LayoutElement::Rule {
            x: 48.0,
            y: 53.599995,
            width: 499.0,
        }
    );
    assert_eq!(
        layout.pages[1].elements[2],
        LayoutElement::Text {
            x: 48.0,
            y: 69.2,
            font_size: 12.0,
            content: "This paragraph belongs to the heading".to_string(),
        }
    );
}

#[test]
fn keeps_heading_with_subheading_and_following_content_when_paginating() {
    let mut style = PdfStyle::default();
    style.page.height = 260.0;
    style.page.margin = 10.0;

    let filler = (1..=4)
        .map(|index| format!("Paragraph {index}"))
        .collect::<Vec<_>>()
        .join("\n\n");
    let markdown = format!(
        "{filler}\n\n## Getting Started\n\n### Prerequisites\n\n- Node.js\n- Rust toolchain"
    );
    let ast = MarkdownEngine::new().read(&markdown).unwrap().ast;
    let layout = LayoutEngine::with_style(style).layout(&ast);

    assert_eq!(layout.pages.len(), 2);
    assert_eq!(
        layout.pages[1].elements[0],
        LayoutElement::Text {
            x: 10.0,
            y: 10.0,
            font_size: 22.0,
            content: "Getting Started".to_string(),
        }
    );
    assert_eq!(
        layout.pages[1].elements[1],
        LayoutElement::Rule {
            x: 10.0,
            y: 17.7,
            width: 575.0,
        }
    );
    assert_eq!(
        layout.pages[1].elements[2],
        LayoutElement::Text {
            x: 10.0,
            y: 66.4,
            font_size: 16.0,
            content: "Prerequisites".to_string(),
        }
    );
    assert_eq!(
        layout.pages[1].elements[3],
        LayoutElement::Rule {
            x: 10.0,
            y: 72.00001,
            width: 575.0,
        }
    );
    assert_eq!(
        layout.pages[1].elements[4],
        LayoutElement::Text {
            x: 26.0,
            y: 87.600006,
            font_size: 12.0,
            content: "- Node.js".to_string(),
        }
    );
}

#[test]
fn applies_structural_values_from_toml() {
    let style = PdfStyle::from_toml(
        r#"
        [page]
        size = "A4"
        margin = 72

        [body]
        font_size = 14
        line_height = 2
        margin_bottom = 20

        [heading.h1]
        font_size = 34
        margin_bottom = 18
        "#,
    );
    let ast = MarkdownEngine::new().read("# Title\n\nBody").unwrap().ast;
    let layout = LayoutEngine::with_style(style).layout(&ast);

    assert_eq!(
        layout.pages[0].elements,
        vec![
            LayoutElement::Text {
                x: 72.0,
                y: 72.0,
                font_size: 34.0,
                content: "Title".to_string(),
            },
            LayoutElement::Rule {
                x: 72.0,
                y: 83.9,
                width: 451.0,
            },
            LayoutElement::Text {
                x: 72.0,
                y: 130.8,
                font_size: 14.0,
                content: "Body".to_string(),
            },
        ]
    );
}
