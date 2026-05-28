use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    paths(crate::handlers::health, crate::handlers::convert),
    components(schemas(
        crate::models::ConvertRequest,
        crate::models::ErrorResponse,
        crate::models::HealthResponse
    )),
    tags((name = "markdown-to-pdf", description = "Markdown to PDF conversion API"))
)]
pub struct ApiDoc;
