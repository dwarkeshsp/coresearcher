// components/Editor.tsx
'use client';

import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

interface EditorProps {
  filePath: string | null;
  onContentChange: (content: string) => void;
}

const tailwindEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#111827', // bg-gray-900
    color: '#f3f4f6', // text color from globals.css (tailwind gray-100)
  },
  '&.cm-editor': {
    fontFamily:
      "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
  },
  '.cm-content': {
    caretColor: '#93c5fd', // blue-300
  },
  '.cm-gutters': {
    backgroundColor: '#1f2937', // bg-gray-800
    color: '#9ca3af', // text-gray-400
    borderRight: '1px solid #374151', // border-gray-700
  },
  '.cm-activeLine': {
    backgroundColor: '#1f2937', // gray-800
  },
  '.cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#374151', // gray-700
  },
  '.cm-cursor': {
    borderLeftColor: '#93c5fd', // blue-300
  },
}, { dark: true });

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
      <div className="h-12 px-4 bg-gray-800 border-b border-gray-700 flex items-center">
        <p className="text-sm font-semibold text-gray-300 truncate" title={filePath}>
          {filePath.split('/').pop()}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={content}
          height="100%"
          theme={tailwindEditorTheme}
          extensions={[markdown(), oneDark, EditorView.lineWrapping]}
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
