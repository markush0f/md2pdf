import { useState, useCallback } from "react";

interface FileData {
  name: string;
  content: string;
}

const SAMPLE_MD = `# The Art of Writing

## Introduction

Writing is a journey through the landscapes of thought. Every word choices matter, every sentence breathes.

## The Process

1. **Brainstorm** - Gather your thoughts
2. **Outline** - Structure your narrative
3. **Draft** - Let the words flow freely
4. **Revise** - Polish until it shines

> "Words are, of course, the most powerful drug used by mankind."
> — Rudyard Kipling

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Conclusion

Remember: *Writing is rewriting*.`;

export default function MarkdownToPDF() {
  const [file, setFile] = useState<FileData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
      <header className="border-b border-stone-800 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <span className="font-semibold text-lg tracking-tight">
              Markdown<span className="text-amber-500">PDF</span>
            </span>
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <svg
                className="w-4 h-4"
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
              {file.name}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-6">
        {!file ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 ${
              isDragging
                ? "border-amber-500 bg-amber-500/5"
                : "border-stone-800 hover:border-stone-700"
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
                className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center transition-colors duration-300 ${
                  isDragging ? "bg-amber-500/20" : "bg-stone-800"
                }`}
              >
                <svg
                  className={`w-10 h-10 transition-colors duration-300 ${
                    isDragging ? "text-amber-500" : "text-stone-400"
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
              <h2 className="text-2xl font-semibold mb-2">
                Drop your markdown file
              </h2>
              <p className="text-stone-500 mb-4">
                or click to browse your files
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 text-sm text-stone-400">
                <svg
                  className="w-4 h-4"
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
                .md files only
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            <div className="flex flex-col rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-900">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-stone-500"
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
                  <span className="text-sm font-medium text-stone-300">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <pre className="font-mono text-sm leading-relaxed text-stone-300 whitespace-pre-wrap">
                  {file.content}
                </pre>
              </div>
            </div>

            <div className="flex flex-col rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-100">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-stone-500"
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
                  <span className="text-sm font-medium text-stone-600">
                    Preview
                  </span>
                  <span className="text-xs text-stone-400">(mocked)</span>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors">
                  <svg
                    className="w-4 h-4"
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
                  Download PDF
                </button>
              </div>
              <div className="flex-1 overflow-auto p-8 bg-white">
                <div className="max-w-2xl mx-auto shadow-xl rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-stone-800 to-stone-900 px-8 py-6">
                    <h1 className="text-3xl font-bold text-stone-100 mb-2">
                      The Art of Writing
                    </h1>
                    <p className="text-stone-400 text-sm">A Journey Through Words</p>
                  </div>
                  <div className="bg-white px-8 py-6 space-y-4 text-stone-700">
                    <h2 className="text-xl font-semibold text-stone-800 pt-4">
                      Introduction
                    </h2>
                    <p className="leading-relaxed">
                      Writing is a journey through the landscapes of thought. Every
                      word choices matter, every sentence breathes.
                    </p>
                    <h2 className="text-xl font-semibold text-stone-800 pt-4">
                      The Process
                    </h2>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>
                        <strong>Brainstorm</strong> — Gather your thoughts
                      </li>
                      <li>
                        <strong>Outline</strong> — Structure your narrative
                      </li>
                      <li>
                        <strong>Draft</strong> — Let the words flow freely
                      </li>
                      <li>
                        <strong>Revise</strong> — Polish until it shines
                      </li>
                    </ol>
                    <blockquote className="border-l-4 border-amber-500 pl-4 py-2 italic text-stone-600 my-6">
                      "Words are, of course, the most powerful drug used by
                      mankind."
                      <cite className="block text-sm text-stone-500 mt-1">
                        — Rudyard Kipling
                      </cite>
                    </blockquote>
                    <h2 className="text-xl font-semibold text-stone-800 pt-4">
                      Code Example
                    </h2>
                    <pre className="bg-stone-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      {`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
                    </pre>
                    <h2 className="text-xl font-semibold text-stone-800 pt-4">
                      Conclusion
                    </h2>
                    <p className="leading-relaxed">
                      Remember: <em>Writing is rewriting</em>.
                    </p>
                    <div className="flex items-center justify-between pt-8 border-t border-stone-200 mt-8">
                      <span className="text-xs text-stone-400">Generated PDF</span>
                      <span className="text-xs text-stone-400">Page 1 of 1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
