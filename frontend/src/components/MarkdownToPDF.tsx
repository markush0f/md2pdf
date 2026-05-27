import { useState, useCallback, useEffect } from "react";

interface FileData {
  name: string;
  content: string;
}

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
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFile(selectedFile);
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="grid grid-cols-[minmax(0,1fr)_4px_minmax(0,1fr)] min-h-screen">
        <div
          className="min-w-0 p-12 flex flex-col transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <header className="mb-12">
            <div className="h-1 bg-[#E85D04] mb-8" />
            <div className="flex items-start justify-between">
              <div>
                <h1
                  className="font-serif text-4xl font-bold tracking-tight"
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
                    className="group flex items-center gap-2 px-3 py-2 border-2 transition-all hover:bg-[#1A1A1A] dark:hover:bg-white"
                    style={{ borderColor: 'var(--text-primary)' }}
                  >
                    <svg
                      className="w-4 h-4 group-hover:text-white dark:group-hover:text-[#1A1A1A] transition-colors"
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
                      className="font-mono text-xs group-hover:text-white dark:group-hover:text-[#1A1A1A] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Clear
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="theme-toggle w-10 h-10 border-2 flex items-center justify-center transition-all hover:bg-[#1A1A1A] dark:hover:bg-white"
                  style={{ borderColor: 'var(--text-primary)', color: darkMode ? '#ffffff' : 'var(--text-primary)' }}
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

          <div className="min-w-0 flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
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
                <label
                  className="flex items-center gap-2 px-4 py-2 border-2 cursor-pointer transition-all hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
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
                </label>
                <button
                  onClick={() => {
                    setContent(DEFAULT_CONTENT);
                    setFile({ name: "untitled.md", content: DEFAULT_CONTENT });
                  }}
                  className="flex items-center gap-2 px-4 py-2 border-2 transition-all hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-mono text-sm">Reset</span>
                </button>
              </div>
              <div
                className="min-w-0 flex-1 border-[3px] transition-colors duration-300"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  boxShadow: darkMode ? '6px 6px 0 0 #ffffff' : '6px 6px 0 0 #1A1A1A'
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
            className="mt-auto pt-8 flex items-center justify-between"
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
          className="min-w-0 p-12 flex flex-col transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <header className="mb-12">
            <div className="h-1 bg-[#E85D04] mb-8" />
            <div className="flex items-start justify-between">
              <div>
                <h1
                  className="font-serif text-4xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  PDF
                </h1>
                <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Preview
                </p>
              </div>
              <span
                className="px-3 py-1 text-xs font-mono"
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: darkMode ? '#1A1A1A' : '#ffffff'
                }}
              >
                MOCK
              </span>
            </div>
          </header>

            <div className="min-w-0 flex-1 overflow-auto">
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
                      <div className="absolute top-12 left-8 right-8 h-px" style={{ backgroundColor: 'var(--border-muted)' }} />
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
            ) : (
              <div
                className="transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  boxShadow: darkMode ? '16px 16px 0 0 #ffffff' : '16px 16px 0 0 #1A1A1A'
                }}
              >
                <div className="bg-[#1A1A1A] px-10 py-8">
                  <h1 className="text-4xl font-bold text-white mb-2 font-serif">
                    The Art of Writing
                  </h1>
                  <p className="text-stone-400 text-sm">
                    A Journey Through Words
                  </p>
                </div>
                <div className="px-10 py-8">
                  <h2
                    className="text-2xl font-bold mb-4 pb-2 border-b-2"
                    style={{ color: '#1A1A1A', borderColor: '#1A1A1A' }}
                  >
                    Introduction
                  </h2>
                  <p className="text-stone-700 leading-relaxed text-lg mb-6">
                    Writing is a journey through the landscapes of thought.
                    Every word choices matter, every sentence breathes.
                  </p>
                  <h2
                    className="text-2xl font-bold mb-4 pb-2 border-b-2"
                    style={{ color: '#1A1A1A', borderColor: '#1A1A1A' }}
                  >
                    The Process
                  </h2>
                  <ol className="space-y-4 mb-6">
                    <li className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-[#E85D04] text-white flex items-center justify-center text-base font-bold">
                        1
                      </span>
                      <span className="text-lg" style={{ color: '#1A1A1A' }}>
                        <strong>Brainstorm</strong> — Gather thoughts
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-[#E85D04] text-white flex items-center justify-center text-base font-bold">
                        2
                      </span>
                      <span className="text-lg" style={{ color: '#1A1A1A' }}>
                        <strong>Outline</strong> — Structure narrative
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-[#E85D04] text-white flex items-center justify-center text-base font-bold">
                        3
                      </span>
                      <span className="text-lg" style={{ color: '#1A1A1A' }}>
                        <strong>Draft</strong> — Let words flow
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-[#E85D04] text-white flex items-center justify-center text-base font-bold">
                        4
                      </span>
                      <span className="text-lg" style={{ color: '#1A1A1A' }}>
                        <strong>Revise</strong> — Polish it shines
                      </span>
                    </li>
                  </ol>
                  <blockquote
                    className="p-6 mb-6 border-l-4 border-[#E85D04]"
                    style={{ backgroundColor: '#F5F0E8' }}
                  >
                    <p className="italic text-stone-700 text-lg">
                      "Words are, of course, the most powerful drug used by
                      mankind."
                    </p>
                    <cite className="text-sm text-stone-500 mt-3 block">
                      — Rudyard Kipling
                    </cite>
                  </blockquote>
                  <h2
                    className="text-2xl font-bold mb-4 pb-2 border-b-2"
                    style={{ color: '#1A1A1A', borderColor: '#1A1A1A' }}
                  >
                    Code Example
                  </h2>
                  <pre className="max-w-full min-w-0 bg-[#1A1A1A] text-[#F5F0E8] p-5 font-mono text-sm mb-6 whitespace-pre-wrap break-all"><code>{`function greet(name) {
  return \`Hello, \${name}!\`;
}`}</code></pre>
                  <h2
                    className="text-2xl font-bold mb-4 pb-2 border-b-2"
                    style={{ color: '#1A1A1A', borderColor: '#1A1A1A' }}
                  >
                    Conclusion
                  </h2>
                  <p className="text-stone-700 leading-relaxed text-lg">
                    Remember: <em>Writing is rewriting</em>.
                  </p>
                  <div
                    className="flex items-center justify-between pt-8 mt-8 border-t"
                    style={{ borderColor: '#e7e5e4' }}
                  >
                    <span className="text-sm text-stone-400 font-mono">
                      Generated by MarkdownPDF
                    </span>
                    <span className="text-sm text-stone-400 font-mono">
                      Page 1 of 1
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {content.trim() && (
            <div
              className="mt-8 pt-8"
              style={{ borderTopColor: 'var(--border-muted)' }}
            >
              <button
                className="group w-full flex items-center justify-center gap-3 px-8 py-4 text-xl font-bold transition-all duration-300"
                style={{
                  backgroundColor: '#E85D04',
                  color: '#ffffff',
                  boxShadow: darkMode ? '4px 4px 0 0 #ffffff' : '4px 4px 0 0 #1A1A1A'
                }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: '#ffffff' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                DOWNLOAD PDF
              </button>
            </div>
          )}

          <footer
            className="mt-auto pt-8 flex items-center justify-between"
            style={{ borderTopColor: 'var(--border-muted)' }}
          >
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--text-secondary)' }}
            >
              High quality output
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
