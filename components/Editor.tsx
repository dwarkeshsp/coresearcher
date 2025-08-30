// components/Editor.tsx
'use client';

import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface EditorProps {
  filePath: string | null;
  onContentChange: (content: string) => void;
}

export default function Editor({ filePath, onContentChange }: EditorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (filePath) {
      loadFile(filePath);
    } else {
      setContent('');
      onContentChange('');
    }
  }, [filePath]);

  const loadFile = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}&type=read`);
      if (!response.ok) {
        throw new Error('Failed to load file');
      }
      const data = await response.json();
      setContent(data.content);
      onContentChange(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
      setContent('');
      onContentChange('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    onContentChange(value);
  };

  if (!filePath) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Select a markdown or text file from the file browser</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading file...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
        <p className="text-sm text-gray-300 truncate" title={filePath}>
          {filePath.split('/').pop()}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={content}
          height="100%"
          theme={oneDark}
          extensions={[markdown()]}
          onChange={handleChange}
          className="h-full"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            highlightSelectionMatches: true,
            searchKeymap: true,
          }}
        />
      </div>
    </div>
  );
}
