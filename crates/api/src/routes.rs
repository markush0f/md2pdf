use axum::{
    routing::{get, post},
    Router,
};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::{handlers, openapi::ApiDoc};

pub fn router() -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/convert", post(handlers::convert))
        .merge(SwaggerUi::new("/docs").url("/api-docs/openapi.json", ApiDoc::openapi()))
}
