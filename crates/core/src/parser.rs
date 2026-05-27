use comrak::{nodes::AstNode, nodes::NodeValue, Arena, Options};

use crate::{LayoutEngine, MarkdownAst, MarkdownBlock, MarkdownDocument, MarkdownError};

pub fn parse_markdown(input: &str) -> Result<MarkdownDocument, MarkdownError> {
    if input.trim().is_empty() {
        return Err(MarkdownError::EmptyInput);
    }

    let ast = parse_ast(input);
    let layout = LayoutEngine::new().layout(&ast);

    Ok(MarkdownDocument {
        source: input.to_string(),
        html: comrak::markdown_to_html(input, &comrak::Options::default()),
        title: extract_title(input),
        ast,
        layout,
    })
}

fn parse_ast(input: &str) -> MarkdownAst {
    let arena = Arena::new();
    let root = comrak::parse_document(&arena, input, &Options::default());
    let mut blocks = Vec::new();

    for node in root.children() {
        collect_block(node, &mut blocks);
    }

    MarkdownAst { blocks }
}

fn collect_block<'a>(node: &'a AstNode<'a>, blocks: &mut Vec<MarkdownBlock>) {
    match &node.data.borrow().value {
        NodeValue::Heading(heading) => blocks.push(MarkdownBlock::Heading {
            level: heading.level,
            text: collect_text(node),
        }),
        NodeValue::Paragraph => blocks.push(MarkdownBlock::Paragraph(collect_text(node))),
        NodeValue::CodeBlock(code_block) => blocks.push(MarkdownBlock::CodeBlock {
            language: code_block
                .info
                .split_whitespace()
                .next()
                .filter(|language| !language.is_empty())
                .map(ToOwned::to_owned),
            code: code_block.literal.clone(),
        }),
        NodeValue::List(_) => blocks.push(MarkdownBlock::List(
            node.children()
                .map(|item| collect_text(item).trim().to_string())
                .filter(|item| !item.is_empty())
                .collect(),
        )),
        _ => {
            for child in node.children() {
                collect_block(child, blocks);
            }
        }
    }
}

fn collect_text<'a>(node: &'a AstNode<'a>) -> String {
    let mut text = String::new();
    collect_text_into(node, &mut text);
    text.trim().to_string()
}

fn collect_text_into<'a>(node: &'a AstNode<'a>, text: &mut String) {
    match &node.data.borrow().value {
        NodeValue::Text(value) => text.push_str(value),
        NodeValue::Code(value) => text.push_str(&value.literal),
        NodeValue::LineBreak | NodeValue::SoftBreak => text.push('\n'),
        _ => {
            for child in node.children() {
                collect_text_into(child, text);
            }
        }
    }
}

fn extract_title(input: &str) -> Option<String> {
    input.lines().find_map(|line| {
        let title = line.strip_prefix("# ")?.trim();

        if title.is_empty() {
            None
        } else {
            Some(title.to_string())
        }
    })
}
