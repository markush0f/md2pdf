use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Deserialize, ToSchema)]
pub struct ConvertRequest {
    pub markdown: String,
    pub theme: Option<String>,
    pub colors: Option<ConvertColors>,
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ConvertColors {
    pub page_background: Option<String>,
    pub body_text: Option<String>,
    pub heading_text: Option<String>,
    pub code_text: Option<String>,
    pub rule: Option<String>,
    pub code_background: Option<String>,
    pub code_border: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct HealthResponse {
    pub status: &'static str,
}
