use std::io::{self, Read};

use markdown_to_pdf_core::MarkdownEngine;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input)?;

    let output = MarkdownEngine::new().read_source(&input)?;
    print!("{output}");

    Ok(())
}
