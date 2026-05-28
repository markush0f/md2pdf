const DEFAULT_STYLE_TOML: &str = include_str!("../../../pdf-style.toml");

#[derive(Debug, Clone, PartialEq)]
pub struct PdfStyle {
    pub page: PageStyle,
    pub body: BodyStyle,
    pub heading: HeadingStyle,
    pub code_block: CodeBlockStyle,
}

#[derive(Debug, Clone, PartialEq)]
pub struct PageStyle {
    pub width: f32,
    pub height: f32,
    pub margin: f32,
}

#[derive(Debug, Clone, PartialEq)]
pub struct BodyStyle {
    pub font_size: f32,
    pub line_height: f32,
    pub margin_bottom: f32,
}

#[derive(Debug, Clone, PartialEq)]
pub struct HeadingStyle {
    pub margin_top: f32,
    pub h1: HeadingLevelStyle,
    pub h2: HeadingLevelStyle,
    pub h3: HeadingLevelStyle,
}

#[derive(Debug, Clone, PartialEq)]
pub struct HeadingLevelStyle {
    pub font_size: f32,
    pub margin_bottom: f32,
}

#[derive(Debug, Clone, PartialEq)]
pub struct CodeBlockStyle {
    pub font_size: f32,
    pub line_height: f32,
    pub padding: f32,
    pub margin_top: f32,
    pub margin_bottom: f32,
}

impl Default for PdfStyle {
    fn default() -> Self {
        Self::from_toml(DEFAULT_STYLE_TOML)
    }
}

impl PdfStyle {
    pub fn from_toml(input: &str) -> Self {
        let mut style = Self::fallback();
        let mut section = String::new();

        for line in input.lines().map(str::trim) {
            if line.is_empty() || line.starts_with('#') {
                continue;
            }

            if line.starts_with('[') && line.ends_with(']') {
                section = line[1..line.len() - 1].to_string();
                continue;
            }

            let Some((key, value)) = line.split_once('=') else {
                continue;
            };
            let key = key.trim();
            let value = value.trim().trim_matches('"');

            match (section.as_str(), key) {
                ("page", "size") if value == "A4" => {
                    style.page.width = 595.0;
                    style.page.height = 842.0;
                }
                ("page", "margin") => set_number(value, &mut style.page.margin),
                ("body", "font_size") => set_number(value, &mut style.body.font_size),
                ("body", "line_height") => set_number(value, &mut style.body.line_height),
                ("body", "margin_bottom") => set_number(value, &mut style.body.margin_bottom),
                ("heading", "margin_top") => set_number(value, &mut style.heading.margin_top),
                ("heading.h1", "font_size") => set_number(value, &mut style.heading.h1.font_size),
                ("heading.h1", "margin_bottom") => {
                    set_number(value, &mut style.heading.h1.margin_bottom)
                }
                ("heading.h2", "font_size") => set_number(value, &mut style.heading.h2.font_size),
                ("heading.h2", "margin_bottom") => {
                    set_number(value, &mut style.heading.h2.margin_bottom)
                }
                ("heading.h3", "font_size") => set_number(value, &mut style.heading.h3.font_size),
                ("heading.h3", "margin_bottom") => {
                    set_number(value, &mut style.heading.h3.margin_bottom)
                }
                ("code_block", "font_size") => set_number(value, &mut style.code_block.font_size),
                ("code_block", "line_height") => {
                    set_number(value, &mut style.code_block.line_height)
                }
                ("code_block", "padding") => set_number(value, &mut style.code_block.padding),
                ("code_block", "margin_top") => set_number(value, &mut style.code_block.margin_top),
                ("code_block", "margin_bottom") => {
                    set_number(value, &mut style.code_block.margin_bottom)
                }
                _ => {}
            }
        }

        style
    }

    fn fallback() -> Self {
        Self {
            page: PageStyle {
                width: 595.0,
                height: 842.0,
                margin: 48.0,
            },
            body: BodyStyle {
                font_size: 12.0,
                line_height: 1.5,
                margin_bottom: 12.0,
            },
            heading: HeadingStyle {
                margin_top: 18.0,
                h1: HeadingLevelStyle {
                    font_size: 30.0,
                    margin_bottom: 8.0,
                },
                h2: HeadingLevelStyle {
                    font_size: 22.0,
                    margin_bottom: 6.0,
                },
                h3: HeadingLevelStyle {
                    font_size: 16.0,
                    margin_bottom: 4.0,
                },
            },
            code_block: CodeBlockStyle {
                font_size: 10.0,
                line_height: 13.0,
                padding: 12.0,
                margin_top: 8.0,
                margin_bottom: 14.0,
            },
        }
    }
}

fn set_number(value: &str, target: &mut f32) {
    if let Ok(value) = value.parse() {
        *target = value;
    }
}
