import { useState, useCallback, useEffect, useRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

interface FileData {
  name: string;
  content: string;
}

type PdfTheme = "light" | "dark";

type PdfColors = {
  pageBackground: string;
  bodyText: string;
  headingText: string;
  codeText: string;
  rule: string;
  codeBackground: string;
  codeBorder: string;
};

type PdfColorKey = keyof PdfColors;

const LIGHT_PDF_COLORS: PdfColors = {
  pageBackground: "#ffffff",
  bodyText: "#333a47",
  headingText: "#1a2e4d",
  codeText: "#212938",
  rule: "#d1d9e6",
  codeBackground: "#f2f5fa",
  codeBorder: "#c7d1e0",
};

const DARK_PDF_COLORS: PdfColors = {
  pageBackground: "#121721",
  bodyText: "#d6e0f2",
  headingText: "#f5faff",
  codeText: "#e3edff",
  rule: "#4d5c75",
  codeBackground: "#1f2636",
  codeBorder: "#5e7394",
};

const COLOR_FIELDS: Array<{ key: PdfColorKey; label: string }> = [
  { key: "pageBackground", label: "Page" },
  { key: "bodyText", label: "Body" },
  { key: "headingText", label: "Heading" },
  { key: "codeText", label: "Code text" },
  { key: "rule", label: "Rule" },
  { key: "codeBackground", label: "Code bg" },
  { key: "codeBorder", label: "Code border" },
];

function colorsForTheme(theme: PdfTheme) {
  return theme === "dark" ? DARK_PDF_COLORS : LIGHT_PDF_COLORS;
}

type ToolbarButtonProps =
  | ({ as?: "button" } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ as: "a" } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ as: "label" } & LabelHTMLAttributes<HTMLLabelElement>);

const toolbarButtonClassName =
  "flex items-center gap-2 px-4 py-2 border-2 transition-all";
const toolbarButtonStyle = {
  borderColor: "var(--border-color)",
  color: "var(--text-primary)",
};

function ToolbarButton(props: ToolbarButtonProps) {
  const { as = "button", className = "", style, children, ...rest } = props;
  const combinedClassName = `${toolbarButtonClassName} ${className}`.trim();
  const combinedStyle = { ...toolbarButtonStyle, ...style };

  if (as === "a") {
    return (
      <a
        className={combinedClassName}
        style={combinedStyle}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children as ReactNode}
      </a>
    );
  }

  if (as === "label") {
    return (
      <label
        className={combinedClassName}
        style={combinedStyle}
        {...(rest as LabelHTMLAttributes<HTMLLabelElement>)}
      >
        {children as ReactNode}
      </label>
    );
  }

  return (
    <button
      className={combinedClassName}
      style={combinedStyle}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children as ReactNode}
    </button>
  );
}

interface PdfCanvasViewerProps {
  pdfUrl: string;
}

interface PdfCanvasLayerProps {
  pdfUrl: string;
  visible: boolean;
  onReady: () => void;
  onTransitionEnd: () => void;
}

function PdfCanvasLayer({
  pdfUrl,
  visible,
  onReady,
  onTransitionEnd,
}: PdfCanvasLayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let loadingTask: { promise: Promise<any>; destroy: () => void } | null = null;
    container.replaceChildren();

    async function renderPdf() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          if (cancelled || !container) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const availableWidth = Math.max(container.parentElement?.clientWidth ?? container.clientWidth, 280);
          const scale = Math.min((availableWidth - 40) / baseViewport.width, 2.4);
          const viewport = page.getViewport({ scale });
          const deviceScale = window.devicePixelRatio || 1;

          const pageFrame = document.createElement("div");
          pageFrame.className = "mx-auto mb-6";
          pageFrame.style.width = `${viewport.width}px`;
          pageFrame.style.maxWidth = "100%";
          pageFrame.style.border = "2px solid var(--border-color)";
          pageFrame.style.boxShadow = "6px 6px 0 0 var(--border-color)";

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width * deviceScale);
          canvas.height = Math.floor(viewport.height * deviceScale);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          canvas.style.display = "block";

          pageFrame.appendChild(canvas);
          container.appendChild(pageFrame);

          const context = canvas.getContext("2d");
          if (!context) return;

          await page.render({
            canvasContext: context,
            viewport,
            transform: deviceScale === 1 ? undefined : [deviceScale, 0, 0, deviceScale, 0, 0],
          }).promise;
        }
      } catch (err) {
        if (cancelled || !container) return;
        const message = err instanceof Error ? err.message : "Failed to render PDF";
        container.replaceChildren();
        const errorMessage = document.createElement("p");
        errorMessage.className = "font-mono text-sm p-8 text-center";
        errorMessage.style.color = "#dc2626";
        errorMessage.textContent = message;
        container.appendChild(errorMessage);
      } finally {
        if (!cancelled) onReady();
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
      container.replaceChildren();
    };
  }, [pdfUrl]);

  return (
    <div
      ref={containerRef}
      onTransitionEnd={onTransitionEnd}
      className="col-start-1 row-start-1 transition-opacity duration-500 ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}

function PdfCanvasViewer({ pdfUrl }: PdfCanvasViewerProps) {
  const nextLayerId = useRef(0);
  const [layers, setLayers] = useState([
    { id: 0, pdfUrl, visible: true },
  ]);

  useEffect(() => {
    setLayers((previousLayers) => {
      const latestLayer = previousLayers[previousLayers.length - 1];
      if (latestLayer?.pdfUrl === pdfUrl) {
        return previousLayers;
      }

      nextLayerId.current += 1;
      return [
        ...previousLayers,
        { id: nextLayerId.current, pdfUrl, visible: false },
      ];
    });
  }, [pdfUrl]);

  const handleLayerReady = useCallback((id: number) => {
    setLayers((previousLayers) =>
      previousLayers.map((layer) =>
        layer.id === id ? { ...layer, visible: true } : layer
      )
    );
  }, []);

  const handleLayerTransitionEnd = useCallback((id: number) => {
    setLayers((previousLayers) => {
      const latestLayer = previousLayers[previousLayers.length - 1];
      if (latestLayer?.id !== id || !latestLayer.visible) {
        return previousLayers;
      }

      return [latestLayer];
    });
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto px-5">
      <div className="grid">
        {layers.map((layer) => (
          <PdfCanvasLayer
            key={layer.id}
            pdfUrl={layer.pdfUrl}
            visible={layer.visible}
            onReady={() => handleLayerReady(layer.id)}
            onTransitionEnd={() => handleLayerTransitionEnd(layer.id)}
          />
        ))}
      </div>
    </div>
  );
}

const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3000";

const DEFAULT_CONTENT = `# Getting Started

Welcome to **MarkdownPDF**. Here's a quick example:

## Code Example

\`\`\`bash
curl "http://iranet-api:8000/servers/server-01/install-command?database_dsn=postgresql%2Basyncpg%3A%2F%2Firanet%3Apass%40db.example.com%3A5432%2Firanet&backend_base_url=http%3A%2F%2F10.0.0.21%3A8000&server_name=Production%2001&environment=production&capabilities=system,processes,services,logs,packages,users,metrics"
\`\`\`

## Features

- **Bold** and *italic* text
- Lists and headings
- Code blocks with proper wrapping

Try editing this content!
`;

export default function MarkdownToPDF() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [file, setFile] = useState<FileData | null>({
    name: "untitled.md",
    content: DEFAULT_CONTENT,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [pdfTheme, setPdfTheme] = useState<PdfTheme>("light");
  const [pdfColors, setPdfColors] = useState<PdfColors>(LIGHT_PDF_COLORS);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) {
      setDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const generatePdf = useCallback(async (
    markdown?: string,
    theme: PdfTheme = pdfTheme,
    keepCurrentPreview = false,
    colors: PdfColors = pdfColors
  ) => {
    if (isGenerating) return;
    const markdownToRender = markdown ?? content;
    setIsGenerating(true);
    setError(null);

    if (pdfUrl && !keepCurrentPreview) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: markdownToRender, theme, colors }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  }, [content, isGenerating, pdfColors, pdfTheme, pdfUrl]);

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.name.endsWith(".md")) {
      alert("Only markdown files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      setFile({
        name: selectedFile.name,
        content: text,
      });
      generatePdf(text);
    };
    reader.readAsText(selectedFile);
  }, [generatePdf]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFile(selectedFile);
    },
    [handleFile]
  );

  const handleReset = useCallback(() => {
    setContent(DEFAULT_CONTENT);
    setFile({ name: "untitled.md", content: DEFAULT_CONTENT });
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setError(null);
  }, [pdfUrl]);

  const handlePdfThemeChange = useCallback((theme: PdfTheme) => {
    const themeColors = colorsForTheme(theme);
    setPdfTheme(theme);
    setPdfColors(themeColors);
    setError(null);
    generatePdf(content, theme, true, themeColors);
  }, [content, generatePdf]);

  const handlePdfColorChange = useCallback((key: PdfColorKey, value: string) => {
    const nextColors = { ...pdfColors, [key]: value };
    setPdfColors(nextColors);
    setError(null);
    generatePdf(content, pdfTheme, true, nextColors);
  }, [content, generatePdf, pdfColors, pdfTheme]);

  const handleResetPdfColors = useCallback(() => {
    const themeColors = colorsForTheme(pdfTheme);
    setPdfColors(themeColors);
    setError(null);
    generatePdf(content, pdfTheme, true, themeColors);
  }, [content, generatePdf, pdfTheme]);

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="grid grid-cols-[minmax(0,1fr)_4px_minmax(0,1fr)] h-full overflow-hidden">
        <div
          className="min-w-0 min-h-0 p-6 flex flex-col overflow-hidden transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <header className="mb-6 shrink-0">
            <div className="h-1 bg-[#E85D04] mb-4" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1
                  className="font-serif text-3xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  MARKDOWN
                </h1>
                <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Editor
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                {file && (
                  <button
                    onClick={() => setFile(null)}
                    className="group flex items-center gap-2 px-3 py-2 border-2 transition-all"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <svg
                      className="w-4 h-4 transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span
                      className="font-mono text-xs transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Clear
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="theme-toggle w-10 h-10 border-2 flex items-center justify-center transition-all"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {darkMode ? (
                    <svg
                      className="w-4 h-4 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </header>

          <div className="min-w-0 min-h-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-4 mb-6 shrink-0">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ backgroundColor: 'var(--text-primary)' }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: darkMode ? '#1A1A1A' : '#ffffff' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={file?.name || 'untitled.md'}
                  onChange={(e) => setFile((prev) => prev ? { ...prev, name: e.target.value } : { name: e.target.value, content })}
                  className="font-mono text-base font-medium bg-transparent outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <p style={{ color: 'var(--text-secondary)' }}>
                  {content.split("\n").length} lines
                </p>
              </div>
              <ToolbarButton as="label" className="cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="font-mono text-sm">Load</span>
                <input
                  type="file"
                  accept=".md"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </ToolbarButton>
              <ToolbarButton
                onClick={handleReset}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-mono text-sm">Reset</span>
              </ToolbarButton>
            </div>
            <div
              className="min-w-0 min-h-0 flex-1 border-[3px] overflow-hidden transition-colors duration-300"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                boxShadow: '6px 6px 0 0 var(--border-color)'
              }}
            >
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (file) {
                    setFile((prev) => prev ? { ...prev, content: e.target.value } : null);
                  }
                }}
                className="w-full h-full p-8 resize-none outline-none font-mono text-sm leading-loose bg-transparent"
                style={{
                  color: 'var(--text-primary)',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-all'
                }}
                spellCheck={false}
              />
            </div>
          </div>

          <footer
            className="pt-4 flex items-center justify-between shrink-0"
            style={{ borderTopColor: 'var(--border-muted)' }}
          >
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--text-secondary)' }}
            >
              MarkdownPDF v1.0
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Split view converter
            </span>
          </footer>
        </div>

        <div
          className="transition-colors duration-300"
          style={{ backgroundColor: 'var(--border-color)' }}
        />

        <div
          className="min-w-0 min-h-0 p-6 flex flex-col overflow-hidden transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <header className="mb-6 shrink-0">
            <div className="h-1 bg-[#E85D04] mb-4" />
            <div className="flex items-start justify-between">
              <div>
                <h1
                  className="font-serif text-3xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  PDF
                </h1>
                <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Preview
                </p>
              </div>
              <div className="relative pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen((open) => !open)}
                  className="flex items-center gap-2 border-2 px-3 py-2 font-mono text-sm transition-all"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: isCustomizeOpen ? 'var(--text-primary)' : 'transparent',
                    color: isCustomizeOpen ? (darkMode ? '#1A1A1A' : '#ffffff') : 'var(--text-primary)'
                  }}
                  aria-expanded={isCustomizeOpen}
                >
                  <span>Customize</span>
                  <svg
                    className="h-4 w-4 shrink-0 transition-transform duration-300"
                    style={{ transform: isCustomizeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isCustomizeOpen && (
                  <div
                    className="fixed left-4 right-4 top-24 z-20 max-h-[calc(100vh-8rem)] overflow-auto border-2 p-3 shadow-[6px_6px_0_0_var(--border-color)] transition-colors duration-300 md:left-auto md:w-[min(42rem,calc(100vw-2rem))]"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-tertiary)'
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                        PDF colors
                      </p>
                      <ToolbarButton
                        onClick={handleResetPdfColors}
                        className="px-3 py-1 text-xs"
                      >
                        Reset colors
                      </ToolbarButton>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
                      {COLOR_FIELDS.map((field) => (
                        <label
                          key={field.key}
                          className="flex min-w-0 items-center justify-between gap-2 border-2 px-2 py-2"
                          style={{
                            borderColor: 'var(--border-muted)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <span className="truncate font-mono text-xs">{field.label}</span>
                          <input
                            type="color"
                            value={pdfColors[field.key]}
                            onChange={(event) => handlePdfColorChange(field.key, event.target.value)}
                            className="h-7 w-8 shrink-0 cursor-pointer bg-transparent p-0"
                            aria-label={`${field.label} color`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex items-center gap-4 mb-6 shrink-0">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ backgroundColor: 'var(--text-primary)' }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: darkMode ? '#1A1A1A' : '#ffffff' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p
                className="font-mono text-base font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {file?.name.replace('.md', '.pdf') || 'document.pdf'}
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                {pdfUrl ? `PDF generated · ${pdfTheme === "dark" ? "Dark" : "Light"}` : "Not generated"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center border-2 font-mono text-sm"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {(["light", "dark"] as const).map((theme) => {
                  const active = pdfTheme === theme;
                  return (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => handlePdfThemeChange(theme)}
                      className="px-3 py-2 capitalize transition-all"
                      style={{
                        backgroundColor: active ? 'var(--text-primary)' : 'transparent',
                        color: active ? (darkMode ? '#1A1A1A' : '#ffffff') : 'var(--text-primary)'
                      }}
                    >
                      {theme}
                    </button>
                  );
                })}
              </div>
            </div>
            <ToolbarButton
              onClick={() => generatePdf()}
              disabled={isGenerating}
              className="disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-mono text-sm">Regenerate</span>
            </ToolbarButton>
            {pdfUrl ? (
              <ToolbarButton
                as="a"
                href={pdfUrl}
                download={file?.name.replace('.md', '.pdf') ?? "document.pdf"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="font-mono text-sm">Download</span>
              </ToolbarButton>
            ) : (
              <ToolbarButton
                disabled
                className="opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="font-mono text-sm">Download</span>
              </ToolbarButton>
            )}
          </div>

          <div className="min-w-0 min-h-0 flex-1 overflow-auto">
            {!content.trim() ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="w-72 h-96 border-[3px] border-dashed flex items-center justify-center mb-6 relative overflow-hidden transition-colors duration-300"
                    style={{
                      borderColor: 'var(--border-muted)',
                      backgroundColor: darkMode ? '#1A1A1A' : '#f5f5f4'
                    }}
                  >
                    <div className="absolute inset-0 opacity-50">
                      <div className="absolute top-4 left-4 right-4 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
                      <div className="absolute top-8 left-6 right-6 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
                      <div className="absolute top-6 left-8 right-8 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
                      <div className="absolute top-16 left-10 right-10 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
                    </div>
                    <p
                      className="font-mono text-sm relative z-10"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Upload a file to preview
                    </p>
                  </div>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="h-full overflow-hidden transition-colors duration-300 text-center">
                <PdfCanvasViewer pdfUrl={pdfUrl} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  {error && (
                    <div
                      className="mb-6 p-4 border-2"
                      style={{
                        borderColor: '#dc2626',
                        backgroundColor: darkMode ? '#1a1a1a' : '#fef2f2',
                        color: '#dc2626'
                      }}
                    >
                      <p className="font-mono text-sm">{error}</p>
                    </div>
                  )}
                  <div
                    className="w-72 h-96 border-[3px] border-dashed flex items-center justify-center mb-6 relative overflow-hidden transition-colors duration-300"
                    style={{
                      borderColor: 'var(--border-muted)',
                      backgroundColor: darkMode ? '#1A1A1A' : '#f5f5f4'
                    }}
                  >
                    <div className="absolute inset-0 opacity-50">
                      <div className="absolute top-4 left-4 right-4 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
                      <div className="absolute top-8 left-6 right-6 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
                      <div className="absolute top-6 left-8 right-8 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
                      <div className="absolute top-16 left-10 right-10 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
                    </div>
                    <p
                      className="font-mono text-sm relative z-10"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {isGenerating ? "Generating PDF..." : "Click Generate to preview"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer
            className="pt-4 flex items-center justify-between shrink-0"
            style={{ borderTopColor: 'var(--border-muted)' }}
          >
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--text-secondary)' }}
            >
              {pdfUrl ? "PDF ready" : "Waiting for generation..."}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              A4 format
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
