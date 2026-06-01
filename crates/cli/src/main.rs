use std::{
    env,
    error::Error,
    ffi::OsString,
    fmt, fs,
    path::{Path, PathBuf},
    process::ExitCode,
};

use markdown_to_pdf_core::{MarkdownEngine, MarkdownError, PdfStyle, PdfTheme};
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
    let mut args: Vec<OsString> = args.into_iter().collect();
    let program = args
        .first()
        .and_then(|arg| arg.to_str())
        .unwrap_or("m2p")
        .to_string();

    if args
        .get(1)
        .is_some_and(|arg| arg == "--help" || arg == "-h")
    {
        return Err(CliError::Usage { program });
    }

    let mut theme = PdfTheme::Light;
    let mut paths = Vec::new();
    let mut iter = args.drain(1..);

    while let Some(arg) = iter.next() {
        if arg == "--theme" {
            let Some(value) = iter.next() else {
                return Err(CliError::Usage { program });
            };
            theme = parse_theme(&value)?;
        } else {
            paths.push(arg);
        }
    }

    if !(1..=2).contains(&paths.len()) {
        return Err(CliError::Usage { program });
    }

    let input_path = PathBuf::from(&paths[0]);
    let output_path = paths
        .get(1)
        .map(PathBuf::from)
        .unwrap_or_else(|| input_path.with_extension("pdf"));
    convert_file(&input_path, &output_path, theme)
}

fn convert_file(input_path: &Path, output_path: &Path, theme: PdfTheme) -> Result<(), CliError> {
    let markdown = fs::read_to_string(input_path).map_err(|source| CliError::ReadInput {
        path: input_path.to_path_buf(),
        source,
    })?;

    let layout = MarkdownEngine::new().compile(&markdown)?;
    let pdf = PdfRenderer::with_style(PdfStyle::for_theme(theme)).render(&layout);

    fs::write(output_path, pdf).map_err(|source| CliError::WriteOutput {
        path: output_path.to_path_buf(),
        source,
    })?;

    Ok(())
}

fn parse_theme(value: &OsString) -> Result<PdfTheme, CliError> {
    match value.to_str() {
        Some("light") => Ok(PdfTheme::Light),
        Some("dark") => Ok(PdfTheme::Dark),
        Some(value) => Err(CliError::InvalidTheme(value.to_string())),
        None => Err(CliError::InvalidTheme(value.to_string_lossy().into_owned())),
    }
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
    InvalidTheme(String),
    Markdown(MarkdownError),
}

impl fmt::Display for CliError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Usage { program } => {
                write!(
                    formatter,
                    "usage: {program} [--theme light|dark] <input.md> [output.pdf]"
                )
            }
            Self::ReadInput { path, source } => {
                write!(formatter, "failed to read {}: {source}", path.display())
            }
            Self::WriteOutput { path, source } => {
                write!(formatter, "failed to write {}: {source}", path.display())
            }
            Self::InvalidTheme(value) => {
                write!(
                    formatter,
                    "unsupported PDF theme: {value} (expected light or dark)"
                )
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
            Self::Usage { .. } | Self::InvalidTheme(_) => None,
        }
    }
}

impl From<MarkdownError> for CliError {
    fn from(error: MarkdownError) -> Self {
        Self::Markdown(error)
    }
}
