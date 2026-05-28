use std::{env, net::SocketAddr};

use markdown_to_pdf_api::router;
use tokio::net::TcpListener;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "m2p_api=info,markdown_to_pdf_api=info,tower_http=info".into()),
        )
        .init();

    let addr = env::var("M2P_API_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:3000".to_string())
        .parse::<SocketAddr>()?;
    let listener = TcpListener::bind(addr).await?;

    info!(%addr, "starting markdown-to-pdf api");
    axum::serve(listener, router()).await?;

    Ok(())
}
