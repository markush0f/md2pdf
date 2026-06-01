use axum::{
    body::Body,
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::IntoResponse,
    Json,
};
use markdown_to_pdf_core::{MarkdownEngine, PdfStyle, PdfTheme};
use markdown_to_pdf_renderer::PdfRenderer;

use crate::{
    error::ApiError,
    models::{ConvertRequest, HealthResponse},
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
    let style = PdfStyle::for_theme(theme);
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
