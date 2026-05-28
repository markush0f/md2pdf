use axum::{
    body::Body,
    http::{header, Request, StatusCode},
};
use http_body_util::BodyExt;
use markdown_to_pdf_api::router;
use serde_json::json;
use tower::ServiceExt;

#[tokio::test]
async fn health_returns_ok() {
    let response = router()
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    assert_eq!(&body[..], br#"{"status":"ok"}"#);
}

#[tokio::test]
async fn convert_returns_pdf_bytes() {
    let response = router()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/convert")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(json!({ "markdown": "# Hello" }).to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(
        response.headers().get(header::CONTENT_TYPE).unwrap(),
        "application/pdf"
    );

    let body = response.into_body().collect().await.unwrap().to_bytes();
    assert!(body.starts_with(b"%PDF"));
}

#[tokio::test]
async fn convert_rejects_empty_markdown() {
    let response = router()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/convert")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(json!({ "markdown": "" }).to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}
