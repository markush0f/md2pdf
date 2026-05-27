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
    <div className="min-h-screen bg-[#F5F0E8] font-serif">
      <header className="bg-[#1A1A1A] text-white px-8 py-6">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#E85D04] flex items-center justify-center">
              <span className="font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MARKDOWN</h1>
              <p className="text-xs text-stone-400 tracking-widest uppercase">
                to PDF Converter
              </p>
            </div>
          </div>
          {file && (
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2">
              <span className="text-sm text-stone-300">Current file:</span>
              <span className="text-sm font-medium text-white">{file.name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-8">
        {!file ? (
          <div
            className={`relative border-[3px] transition-all duration-200 ${
              isDragging
                ? "border-[#E85D04] bg-[#E85D04]/5"
                : "border-[#1A1A1A]"
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
            <div className="grid grid-cols-2">
              <div className="p-16 flex flex-col items-center justify-center border-r-[3px] border-[#1A1A1A] bg-[#FDFBF7]">
                <div className="w-24 h-24 border-[3px] border-[#1A1A1A] flex items-center justify-center mb-8 bg-white">
                  <svg
                    className="w-12 h-12 text-[#1A1A1A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold mb-4 text-[#1A1A1A]">
                  DROP FILE
                </h2>
                <p className="text-stone-600 mb-8 text-lg">
                  Drag & drop your markdown file here
                </p>
                <div className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white text-sm">
                  <span className="font-mono">.md</span>
                  <span className="text-stone-400">only</span>
                </div>
              </div>
              <div className="p-16 flex flex-col items-center justify-center bg-[#E85D04]/10">
                <div className="space-y-4 text-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#E85D04]" />
                    <span className="text-lg text-[#1A1A1A]">Markdown Preview</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#1A1A1A]" />
                    <span className="text-lg text-[#1A1A1A]">PDF Output</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-stone-300" />
                    <span className="text-lg text-stone-500">Side by Side</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8 h-[calc(100vh-14rem)]">
            <div className="flex flex-col border-[3px] border-[#1A1A1A] bg-[#FDFBF7]">
              <div className="flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#E85D04] flex items-center justify-center">
                    <span className="font-bold text-sm">M</span>
                  </div>
                  <span className="font-mono text-sm">{file.name}</span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="w-8 h-8 border-2 border-white flex items-center justify-center hover:bg-white hover:text-[#1A1A1A] transition-colors"
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
              <div className="flex-1 overflow-auto p-8">
                <pre className="font-mono text-sm leading-loose text-[#1A1A1A] whitespace-pre-wrap">
                  {file.content}
                </pre>
              </div>
            </div>

            <div className="flex flex-col border-[3px] border-[#1A1A1A] bg-white overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-[#1A1A1A]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#E85D04] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="font-mono text-sm text-stone-600">
                    PDF Preview
                  </span>
                  <span className="text-xs bg-[#E85D04] text-white px-2 py-0.5">
                    MOCK
                  </span>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-[#E85D04] text-white font-bold hover:bg-[#1A1A1A] transition-colors">
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
                  DOWNLOAD
                </button>
              </div>
              <div className="flex-1 overflow-auto p-8 bg-stone-100">
                <div className="bg-white shadow-[8px_8px_0_0_#1A1A1A] max-w-2xl mx-auto">
                  <div className="bg-[#1A1A1A] px-8 py-6">
                    <h1 className="text-3xl font-bold text-white mb-1">
                      The Art of Writing
                    </h1>
                    <p className="text-stone-400 text-sm">A Journey Through Words</p>
                  </div>
                  <div className="bg-white px-8 py-6">
                    <h2 className="text-xl font-bold text-[#1A1A1A] pt-4 mb-3 border-b-2 border-[#1A1A1A]">
                      Introduction
                    </h2>
                    <p className="text-stone-700 leading-relaxed mb-4">
                      Writing is a journey through the landscapes of thought. Every
                      word choices matter, every sentence breathes.
                    </p>
                    <h2 className="text-xl font-bold text-[#1A1A1A] pt-4 mb-3 border-b-2 border-[#1A1A1A]">
                      The Process
                    </h2>
                    <ol className="list-none space-y-2 ml-0">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-[#E85D04] text-white flex items-center justify-center text-sm font-bold">
                          1
                        </span>
                        <span>
                          <strong>Brainstorm</strong> — Gather your thoughts
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-[#E85D04] text-white flex items-center justify-center text-sm font-bold">
                          2
                        </span>
                        <span>
                          <strong>Outline</strong> — Structure your narrative
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-[#E85D04] text-white flex items-center justify-center text-sm font-bold">
                          3
                        </span>
                        <span>
                          <strong>Draft</strong> — Let the words flow freely
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-[#E85D04] text-white flex items-center justify-center text-sm font-bold">
                          4
                        </span>
                        <span>
                          <strong>Revise</strong> — Polish until it shines
                        </span>
                      </li>
                    </ol>
                    <blockquote className="bg-[#F5F0E8] p-4 my-6 border-l-4 border-[#E85D04]">
                      <p className="italic text-stone-700">
                        "Words are, of course, the most powerful drug used by
                        mankind."
                      </p>
                      <cite className="text-sm text-stone-500 mt-2 block">
                        — Rudyard Kipling
                      </cite>
                    </blockquote>
                    <h2 className="text-xl font-bold text-[#1A1A1A] pt-4 mb-3 border-b-2 border-[#1A1A1A]">
                      Code Example
                    </h2>
                    <pre className="bg-[#1A1A1A] text-[#F5F0E8] p-4 font-mono text-sm overflow-x-auto">
                      {`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
                    </pre>
                    <h2 className="text-xl font-bold text-[#1A1A1A] pt-4 mb-3 border-b-2 border-[#1A1A1A]">
                      Conclusion
                    </h2>
                    <p className="text-stone-700 leading-relaxed">
                      Remember: <em>Writing is rewriting</em>.
                    </p>
                    <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-stone-200">
                      <span className="text-xs text-stone-400 font-mono">
                        Generated by MarkdownPDF
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        Page 1 of 1
                      </span>
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
