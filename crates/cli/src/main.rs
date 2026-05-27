use std::{
    env,
    error::Error,
    ffi::OsString,
    fmt, fs,
    path::{Path, PathBuf},
    process::ExitCode,
};

use markdown_to_pdf_core::{MarkdownEngine, MarkdownError};
use markdown_to_pdf_renderer::PdfRenderer;

fn main() -> ExitCode {
    match run(env::args_os()) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error}");
            ExitCode::FAILURE
        }
    }
}

fn run(args: impl IntoIterator<Item = OsString>) -> Result<(), CliError> {
    let args: Vec<OsString> = args.into_iter().collect();

    if !(2..=3).contains(&args.len()) || args.get(1).is_some_and(|arg| arg == "--help" || arg == "-h") {
        return Err(CliError::Usage {
            program: args
                .first()
                .and_then(|arg| arg.to_str())
                .unwrap_or("m2p")
                .to_string(),
        });
    }

    let input_path = PathBuf::from(&args[1]);
    let output_path = args
        .get(2)
        .map(PathBuf::from)
        .unwrap_or_else(|| input_path.with_extension("pdf"));
    convert_file(&input_path, &output_path)
}

fn convert_file(input_path: &Path, output_path: &Path) -> Result<(), CliError> {
    let markdown = fs::read_to_string(input_path).map_err(|source| CliError::ReadInput {
        path: input_path.to_path_buf(),
        source,
    })?;

    let layout = MarkdownEngine::new().compile(&markdown)?;
    let pdf = PdfRenderer::new().render(&layout);

    fs::write(output_path, pdf).map_err(|source| CliError::WriteOutput {
        path: output_path.to_path_buf(),
        source,
    })?;

    Ok(())
}

#[derive(Debug)]
enum CliError {
    Usage {
        program: String,
    },
    ReadInput {
        path: PathBuf,
        source: std::io::Error,
    },
    WriteOutput {
        path: PathBuf,
        source: std::io::Error,
    },
    Markdown(MarkdownError),
}

impl fmt::Display for CliError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Usage { program } => write!(formatter, "usage: {program} <input.md> [output.pdf]"),
            Self::ReadInput { path, source } => {
                write!(formatter, "failed to read {}: {source}", path.display())
            }
            Self::WriteOutput { path, source } => {
                write!(formatter, "failed to write {}: {source}", path.display())
            }
            Self::Markdown(source) => write!(formatter, "failed to parse markdown: {source}"),
        }
    }
}

impl Error for CliError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            Self::ReadInput { source, .. } | Self::WriteOutput { source, .. } => Some(source),
            Self::Markdown(source) => Some(source),
            Self::Usage { .. } => None,
        }
    }
}

impl From<MarkdownError> for CliError {
    fn from(error: MarkdownError) -> Self {
        Self::Markdown(error)
    }
}
