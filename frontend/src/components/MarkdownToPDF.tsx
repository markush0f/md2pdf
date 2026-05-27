import { useState, useCallback, useEffect } from "react";

interface FileData {
  name: string;
  content: string;
}

export default function MarkdownToPDF() {
  const [file, setFile] = useState<FileData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      setFile({
        name: selectedFile.name,
        content: e.target?.result as string,
      });
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
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
      <div className="grid grid-cols-[1fr_4px_1fr] min-h-screen">
        <div
          className="p-12 flex flex-col transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E85D04] flex items-center justify-center">
                <span className="font-bold text-xl text-white">M</span>
              </div>
              <div>
                <h1
                  className="font-serif text-2xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  MARKDOWN
                </h1>
                <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                  Editor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {file && (
                <button
                  onClick={() => setFile(null)}
                  className="group flex items-center gap-2 px-4 py-2 border-2 transition-all hover:bg-[#1A1A1A] dark:hover:bg-white"
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
                    className="font-mono text-sm group-hover:text-white dark:group-hover:text-[#1A1A1A] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Clear
                  </span>
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-12 h-12 border-2 flex items-center justify-center transition-all hover:bg-[#1A1A1A] dark:hover:bg-white"
                style={{ borderColor: 'var(--text-primary)' }}
              >
                {darkMode ? (
                  <svg
                    className="w-5 h-5"
                    style={{ color: 'var(--text-primary)' }}
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
                    className="w-5 h-5"
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
          </header>

          {!file ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className={`relative w-full max-w-lg border-[3px] p-20 transition-all duration-300 cursor-pointer ${
                  isDragging ? "border-[#E85D04] bg-[#E85D04]/5 scale-105" : ""
                }`}
                style={{
                  borderColor: isDragging ? '#E85D04' : 'var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)'
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept=".md"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-24 h-24 border-[3px] flex items-center justify-center mb-8 transition-all duration-300"
                    style={{
                      borderColor: isDragging ? '#E85D04' : 'var(--border-color)',
                      backgroundColor: '#F5F0E8'
                    }}
                  >
                    <svg
                      className="w-12 h-12 transition-colors duration-300"
                      style={{ color: isDragging ? '#E85D04' : 'var(--text-primary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h2
                    className="text-3xl font-bold mb-3 tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {isDragging ? "Release" : "Drop File"}
                  </h2>
                  <p
                    className="mb-8 text-lg"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {isDragging ? "to upload your markdown" : "Drag & drop or click to browse"}
                  </p>
                  <div
                    className="flex items-center gap-3 px-5 py-3"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                  >
                    <svg
                      className="w-4 h-4 text-[#E85D04]"
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
                    <span
                      className="font-mono text-sm"
                      style={{ color: darkMode ? '#1A1A1A' : '#ffffff' }}
                    >
                      .md files only
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
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
                <div>
                  <span
                    className="font-mono text-base font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {file.name}
                  </span>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {file.content.split("\n").length} lines
                  </p>
                </div>
              </div>
              <div
                className="flex-1 border-[3px] p-8 overflow-auto transition-colors duration-300"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  boxShadow: darkMode ? '6px 6px 0 0 #ffffff' : '6px 6px 0 0 #1A1A1A'
                }}
              >
                <pre
                  className="font-mono text-sm leading-loose whitespace-pre-wrap"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {file.content}
                </pre>
              </div>
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
          className="p-12 flex flex-col transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E85D04] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <div>
                <h1
                  className="font-serif text-2xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  PDF
                </h1>
                <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                  Preview
                </p>
              </div>
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
          </header>

          <div className="flex-1 overflow-auto">
            {!file ? (
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
                  <pre className="bg-[#1A1A1A] text-[#F5F0E8] p-5 font-mono text-sm mb-6 overflow-x-auto">
                    {`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
                  </pre>
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

          {file && (
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
