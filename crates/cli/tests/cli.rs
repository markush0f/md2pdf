use std::{fs, process::Command};

#[test]
fn converts_markdown_file_to_pdf_file() {
    let temp_dir = std::env::temp_dir().join(format!(
        "markdown-to-pdf-cli-test-{}",
        std::process::id()
    ));
    fs::create_dir_all(&temp_dir).unwrap();

    let input_path = temp_dir.join("input.md");
    let output_path = temp_dir.join("output.pdf");
    fs::write(&input_path, "# Hello\n\nGenerated from the CLI.\n").unwrap();

    let output = Command::new(env!("CARGO_BIN_EXE_m2p"))
        .arg(&input_path)
        .arg(&output_path)
        .output()
        .unwrap();

    assert!(output.status.success(), "stderr: {}", String::from_utf8_lossy(&output.stderr));

    let pdf = fs::read(&output_path).unwrap();
    assert!(pdf.starts_with(b"%PDF-1.4"));
    assert!(pdf.ends_with(b"%%EOF\n"));

    fs::remove_dir_all(temp_dir).unwrap();
}

#[test]
fn defaults_output_to_input_name_with_pdf_extension() {
    let temp_dir = std::env::temp_dir().join(format!(
        "markdown-to-pdf-cli-default-test-{}",
        std::process::id()
    ));
    fs::create_dir_all(&temp_dir).unwrap();

    let input_path = temp_dir.join("document.md");
    let output_path = temp_dir.join("document.pdf");
    fs::write(&input_path, "# Hello\n\nGenerated from the CLI.\n").unwrap();

    let output = Command::new(env!("CARGO_BIN_EXE_m2p"))
        .arg(&input_path)
        .output()
        .unwrap();

    assert!(output.status.success(), "stderr: {}", String::from_utf8_lossy(&output.stderr));

    let pdf = fs::read(&output_path).unwrap();
    assert!(pdf.starts_with(b"%PDF-1.4"));
    assert!(pdf.ends_with(b"%%EOF\n"));

    fs::remove_dir_all(temp_dir).unwrap();
}
