import { useState, useCallback } from "react";

interface FileData {
  name: string;
  content: string;
}

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
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="grid grid-cols-[1fr_2px_1fr] min-h-screen">
        <div className="bg-[#FDFBF7] p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#E85D04] flex items-center justify-center">
              <span className="font-bold text-lg text-white">M</span>
            </div>
            <span className="font-serif text-xl font-bold text-[#1A1A1A]">
              MARKDOWN
            </span>
          </div>

          {!file ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className={`w-full max-w-md border-[3px] p-16 transition-all duration-200 ${
                    isDragging
                      ? "border-[#E85D04] bg-[#E85D04]/5"
                      : "border-[#1A1A1A] bg-white"
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
                    <div className="w-20 h-20 border-[3px] border-[#1A1A1A] flex items-center justify-center mb-6 bg-[#F5F0E8]">
                      <svg
                        className="w-10 h-10 text-[#1A1A1A]"
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
                    <h2 className="text-2xl font-bold mb-2 text-[#1A1A1A]">
                      DROP FILE
                    </h2>
                    <p className="text-stone-600 mb-6">
                      Drag & drop or click to browse
                    </p>
                    <span className="font-mono text-sm bg-[#1A1A1A] text-white px-4 py-2">
                      .md only
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1A1A1A] flex items-center justify-center">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-mono text-sm text-[#1A1A1A]">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="w-8 h-8 border-2 border-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors"
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
              <div className="flex-1 border-[3px] border-[#1A1A1A] bg-white p-6 overflow-auto">
                <pre className="font-mono text-sm leading-relaxed text-[#1A1A1A] whitespace-pre-wrap">
                  {file.content}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1A1A1A]" />

        <div className="bg-white p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <span className="font-serif text-xl font-bold text-[#1A1A1A]">
              PDF PREVIEW
            </span>
            <span className="text-xs bg-[#E85D04] text-white px-2 py-0.5 font-mono">
              MOCK
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              {!file ? (
                <div className="text-center">
                  <div className="w-full h-80 border-[3px] border-dashed border-stone-300 flex items-center justify-center mb-6 bg-stone-50">
                    <p className="text-stone-400 font-mono text-sm">
                      Upload a file to see preview
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-[8px_8px_0_0_#1A1A1A]">
                  <div className="bg-[#1A1A1A] px-6 py-5">
                    <h1 className="text-2xl font-bold text-white mb-0.5 font-serif">
                      The Art of Writing
                    </h1>
                    <p className="text-stone-400 text-xs">
                      A Journey Through Words
                    </p>
                  </div>
                  <div className="px-6 py-5">
                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-2 pb-1 border-b-2 border-[#1A1A1A]">
                      Introduction
                    </h2>
                    <p className="text-stone-700 text-sm leading-relaxed mb-4">
                      Writing is a journey through the landscapes of thought.
                      Every word choices matter, every sentence breathes.
                    </p>
                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-2 pb-1 border-b-2 border-[#1A1A1A]">
                      The Process
                    </h2>
                    <ol className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#E85D04] text-white flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <span className="text-sm">
                          <strong>Brainstorm</strong> — Gather thoughts
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#E85D04] text-white flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span className="text-sm">
                          <strong>Outline</strong> — Structure narrative
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#E85D04] text-white flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span className="text-sm">
                          <strong>Draft</strong> — Let words flow
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#E85D04] text-white flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        <span className="text-sm">
                          <strong>Revise</strong> — Polish it shines
                        </span>
                      </li>
                    </ol>
                    <blockquote className="bg-[#F5F0E8] p-3 mb-4 border-l-4 border-[#E85D04]">
                      <p className="italic text-stone-700 text-sm">
                        "Words are, of course, the most powerful drug used by
                        mankind."
                      </p>
                      <cite className="text-xs text-stone-500 mt-1 block">
                        — Rudyard Kipling
                      </cite>
                    </blockquote>
                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-2 pb-1 border-b-2 border-[#1A1A1A]">
                      Code Example
                    </h2>
                    <pre className="bg-[#1A1A1A] text-[#F5F0E8] p-3 font-mono text-xs mb-4 overflow-x-auto">
                      {`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
                    </pre>
                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-2 pb-1 border-b-2 border-[#1A1A1A]">
                      Conclusion
                    </h2>
                    <p className="text-stone-700 text-sm leading-relaxed">
                      Remember: <em>Writing is rewriting</em>.
                    </p>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-200">
                      <span className="text-[10px] text-stone-400 font-mono">
                        MarkdownPDF
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Page 1 of 1
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {file && (
            <div className="mt-6">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#E85D04] text-white font-bold text-lg hover:bg-[#1A1A1A] transition-colors">
                <svg
                  className="w-5 h-5"
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
        </div>
      </div>
    </div>
  );
}
