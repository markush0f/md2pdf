#!/usr/bin/env bash
set -euo pipefail

cargo run -q -p markdown_to_pdf_core --example read_markdown
