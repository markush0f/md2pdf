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
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
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
    <div
      data-theme={darkMode ? "dark" : "light"}
      className="min-h-screen bg-[#F5F0E8] dark:bg-[#0A0A0A] transition-colors duration-300"
    >
      <div className="grid grid-cols-[1fr_4px_1fr] min-h-screen">
        <div className="bg-[#FDFBF7] dark:bg-[#111111] p-12 flex flex-col transition-colors duration-300">
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E85D04] flex items-center justify-center">
                <span className="font-bold text-xl text-white">M</span>
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
                  MARKDOWN
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 tracking-widest uppercase">
                  Editor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {file && (
                <button
                  onClick={() => setFile(null)}
                  className="group flex items-center gap-2 px-4 py-2 border-2 border-[#1A1A1A] dark:border-white hover:bg-[#1A1A1A] dark:hover:bg-white transition-all"
                >
                  <svg
                    className="w-4 h-4 text-[#1A1A1A] dark:text-white group-hover:text-white dark:group-hover:text-[#1A1A1A] transition-colors"
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
                  <span className="font-mono text-sm text-[#1A1A1A] dark:text-white group-hover:text-white dark:group-hover:text-[#1A1A1A] transition-colors">
                    Clear
                  </span>
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-12 h-12 border-2 border-[#1A1A1A] dark:border-white flex items-center justify-center hover:bg-[#1A1A1A] dark:hover:bg-white transition-all"
              >
                {darkMode ? (
                  <svg
                    className="w-5 h-5 text-white dark:text-[#1A1A1A]"
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
                    className="w-5 h-5 text-[#1A1A1A] dark:text-white"
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
                  isDragging
                    ? "border-[#E85D04] bg-[#E85D04]/5 scale-105"
                    : "border-[#1A1A1A] dark:border-white bg-white dark:bg-[#1A1A1A] hover:shadow-[8px_8px_0_0_#1A1A1A] dark:hover:shadow-[8px_8px_0_0_#ffffff]"
                }`}
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
                    className={`w-24 h-24 border-[3px] flex items-center justify-center mb-8 transition-all duration-300 ${
                      isDragging
                        ? "border-[#E85D04] bg-[#E85D04]/10"
                        : "border-[#1A1A1A] dark:border-white bg-[#F5F0E8] dark:bg-[#222222]"
                    }`}
                  >
                    <svg
                      className={`w-12 h-12 transition-colors duration-300 ${
                        isDragging
                          ? "text-[#E85D04]"
                          : "text-[#1A1A1A] dark:text-white"
                      }`}
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
                  <h2 className="text-3xl font-bold mb-3 text-[#1A1A1A] dark:text-white tracking-tight">
                    {isDragging ? "Release" : "Drop File"}
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 mb-8 text-lg">
                    {isDragging
                      ? "to upload your markdown"
                      : "Drag & drop or click to browse"}
                  </p>
                  <div className="flex items-center gap-3 px-5 py-3 bg-[#1A1A1A] dark:bg-white">
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
                    <span className="font-mono text-sm text-white dark:text-[#1A1A1A]">
                      .md files only
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-[#1A1A1A] dark:bg-white flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white dark:text-[#1A1A1A]"
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
                  <span className="font-mono text-base text-[#1A1A1A] dark:text-white font-medium">
                    {file.name}
                  </span>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {file.content.split("\n").length} lines
                  </p>
                </div>
              </div>
              <div className="flex-1 border-[3px] border-[#1A1A1A] dark:border-white bg-white dark:bg-[#1A1A1A] p-8 overflow-auto shadow-[6px_6px_0_0_#1A1A1A] dark:shadow-[6px_6px_0_0_#ffffff] transition-colors duration-300">
                <pre className="font-mono text-sm leading-loose text-[#1A1A1A] dark:text-white whitespace-pre-wrap">
                  {file.content}
                </pre>
              </div>
            </div>
          )}

          <footer className="mt-auto pt-8 flex items-center justify-between border-t border-stone-200 dark:border-stone-800">
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
              MarkdownPDF v1.0
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              Split view converter
            </span>
          </footer>
        </div>

        <div className="bg-[#1A1A1A] dark:bg-white" />

        <div className="bg-white dark:bg-[#111111] p-12 flex flex-col transition-colors duration-300">
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
                <h1 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
                  PDF
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 tracking-widest uppercase">
                  Preview
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-mono">
              MOCK
            </span>
          </header>

          <div className="flex-1 overflow-auto">
            {!file ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-72 h-96 border-[3px] border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center mb-6 bg-stone-50 dark:bg-[#1A1A1A] relative overflow-hidden transition-colors duration-300">
                    <div className="absolute inset-0 opacity-50">
                      <div className="absolute top-4 left-4 right-4 h-px bg-stone-200 dark:bg-stone-800" />
                      <div className="absolute top-8 left-6 right-6 h-px bg-stone-200 dark:bg-stone-800" />
                      <div className="absolute top-12 left-8 right-8 h-px bg-stone-200 dark:bg-stone-800" />
                      <div className="absolute top-16 left-10 right-10 h-px bg-stone-200 dark:bg-stone-800" />
                    </div>
                    <p className="text-stone-400 dark:text-stone-500 font-mono text-sm relative z-10">
                      Upload a file to preview
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#FDFBF7] shadow-[16px_16px_0_0_#1A1A1A] dark:shadow-[16px_16px_0_0_#ffffff] transition-colors duration-300">
                <div className="bg-[#1A1A1A] px-10 py-8">
                  <h1 className="text-4xl font-bold text-white mb-2 font-serif">
                    The Art of Writing
                  </h1>
                  <p className="text-stone-400 text-sm">
                    A Journey Through Words
                  </p>
                </div>
                <div className="px-10 py-8">
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#1A1A1A]">
                    Introduction
                  </h2>
                  <p className="text-stone-700 leading-relaxed text-lg mb-6">
                    Writing is a journey through the landscapes of thought.
                    Every word choices matter, every sentence breathes.
                  </p>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#1A1A1A]">
                    The Process
                  </h2>
                  <ol className="space-y-4 mb-6">
                    <li className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-[#E85D04] text-white flex items-center justify-center text-base font-bold">
                        1
                      </span>
                      <span className="text-lg text-[#1A1A1A]">
                        <strong>Brainstorm</strong> — Gather thoughts
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-[#E85D04] text-white flex items-center justify-center text-base font-bold">
                        2
                      </span>
                      <span className="text-lg text-[#1A1A1A]">
                        <strong>Outline</strong> — Structure narrative
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-[#E85D04] text-white flex items-center justify-center text-base font-bold">
                        3
                      </span>
                      <span className="text-lg text-[#1A1A1A]">
                        <strong>Draft</strong> — Let words flow
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-[#E85D04] text-white flex items-center justify-center text-base font-bold">
                        4
                      </span>
                      <span className="text-lg text-[#1A1A1A]">
                        <strong>Revise</strong> — Polish it shines
                      </span>
                    </li>
                  </ol>
                  <blockquote className="bg-[#F5F0E8] dark:bg-stone-200 p-6 mb-6 border-l-4 border-[#E85D04]">
                    <p className="italic text-stone-700 dark:text-stone-800 text-lg">
                      "Words are, of course, the most powerful drug used by
                      mankind."
                    </p>
                    <cite className="text-sm text-stone-500 dark:text-stone-600 mt-3 block">
                      — Rudyard Kipling
                    </cite>
                  </blockquote>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#1A1A1A]">
                    Code Example
                  </h2>
                  <pre className="bg-[#1A1A1A] text-[#F5F0E8] p-5 font-mono text-sm mb-6 overflow-x-auto">
                    {`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
                  </pre>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 pb-2 border-b-2 border-[#1A1A1A]">
                    Conclusion
                  </h2>
                  <p className="text-stone-700 leading-relaxed text-lg">
                    Remember: <em>Writing is rewriting</em>.
                  </p>
                  <div className="flex items-center justify-between pt-8 mt-8 border-t border-stone-200">
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
            <div className="mt-8 pt-8 border-t border-stone-200 dark:border-stone-800">
              <button className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#E85D04] text-white font-bold text-xl hover:bg-[#1A1A1A] dark:hover:bg-white dark:hover:text-[#1A1A1A] transition-all duration-300 shadow-[4px_4px_0_0_#1A1A1A] dark:shadow-[4px_4px_0_0_#ffffff] hover:shadow-[6px_6px_0_0_#1A1A1A] dark:hover:shadow-[6px_6px_0_0_#ffffff]">
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

          <footer className="mt-auto pt-8 flex items-center justify-between border-t border-stone-200 dark:border-stone-800">
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
              High quality output
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              A4 format
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
