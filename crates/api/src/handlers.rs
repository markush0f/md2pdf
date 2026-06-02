use axum::{
    body::Body,
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::IntoResponse,
    Json,
};
use markdown_to_pdf_core::{MarkdownEngine, PdfColor, PdfStyle, PdfTheme};
use markdown_to_pdf_renderer::PdfRenderer;

use crate::{
    error::ApiError,
    models::{ConvertColors, ConvertRequest, HealthResponse},
};

#[utoipa::path(
    get,
    path = "/health",
    responses((status = 200, description = "API health status", body = HealthResponse))
)]
pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

#[utoipa::path(
    post,
    path = "/convert",
    request_body = ConvertRequest,
    responses(
        (status = 200, description = "Generated PDF", content_type = "application/pdf"),
        (status = 400, description = "Invalid markdown", body = crate::models::ErrorResponse)
    )
)]
pub async fn convert(Json(payload): Json<ConvertRequest>) -> Result<impl IntoResponse, ApiError> {
    let theme = match payload.theme.as_deref().unwrap_or("light") {
        "light" => PdfTheme::Light,
        "dark" => PdfTheme::Dark,
        value => {
            return Err(ApiError::BadRequest(format!(
                "unsupported PDF theme: {value}"
            )))
        }
    };
    let mut style = PdfStyle::for_theme(theme);
    if let Some(colors) = &payload.colors {
        apply_color_overrides(&mut style, colors)?;
    }
    let layout = MarkdownEngine::new()
        .compile(&payload.markdown)
        .map_err(|error| ApiError::BadRequest(format!("failed to parse markdown: {error}")))?;
    let pdf = PdfRenderer::with_style(style).render(&layout);

    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("application/pdf"),
    );
    headers.insert(
        header::CONTENT_DISPOSITION,
        HeaderValue::from_static("inline; filename=\"document.pdf\""),
    );

    Ok((StatusCode::OK, headers, Body::from(pdf)))
}

fn apply_color_overrides(style: &mut PdfStyle, colors: &ConvertColors) -> Result<(), ApiError> {
    apply_color(
        &colors.page_background,
        &mut style.colors.page_background,
        "pageBackground",
    )?;
    apply_color(&colors.body_text, &mut style.colors.body_text, "bodyText")?;
    apply_color(
        &colors.heading_text,
        &mut style.colors.heading_text,
        "headingText",
    )?;
    apply_color(&colors.code_text, &mut style.colors.code_text, "codeText")?;
    apply_color(&colors.rule, &mut style.colors.rule, "rule")?;
    apply_color(
        &colors.code_background,
        &mut style.colors.code_background,
        "codeBackground",
    )?;
    apply_color(
        &colors.code_border,
        &mut style.colors.code_border,
        "codeBorder",
    )?;

    Ok(())
}

fn apply_color(value: &Option<String>, target: &mut PdfColor, field: &str) -> Result<(), ApiError> {
    let Some(value) = value else {
        return Ok(());
    };

    let Some(color) = PdfColor::from_hex(value) else {
        return Err(ApiError::BadRequest(format!(
            "invalid color for {field}: expected #RRGGBB"
        )));
    };

    *target = color;
    Ok(())
}
