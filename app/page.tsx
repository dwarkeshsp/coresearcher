'use client';

import { useState } from 'react';
import FileBrowser from '@/components/FileBrowser';
import Editor from '@/components/Editor';
import AIPanel from '@/components/AIPanel';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState('');

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  const handleContentChange = (content: string) => {
    setDocumentContent(content);
  };

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Left Panel - File Browser */}
      <div className="w-[300px] border-r border-gray-700 flex-shrink-0">
        <FileBrowser onFileSelect={handleFileSelect} />
      </div>

      {/* Center Panel - Editor */}
      <div className="flex-1 min-w-0">
        <Editor filePath={selectedFile} onContentChange={handleContentChange} />
      </div>

      {/* Right Panel - AI Interface */}
      <div className="w-[400px] border-l border-gray-700 flex-shrink-0">
        <AIPanel documentContent={documentContent} filePath={selectedFile} />
      </div>
    </div>
  );
}
