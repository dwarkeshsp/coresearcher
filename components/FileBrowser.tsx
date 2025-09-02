// components/FileBrowser.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Home } from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface FileBrowserProps {
  onFileSelect: (path: string) => void;
}

export default function FileBrowser({ onFileSelect }: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDirectory('');
  }, []);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error('Failed to load directory');
      }
      const data = await response.json();
      setFiles(data);
      setCurrentPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isDirectory) {
      toggleFolder(file.path);
    } else {
      onFileSelect(file.path);
    }
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer rounded ${
            level > 0 ? 'ml-4' : ''
          }`}
          onClick={() => handleFileClick(item)}
        >
          {item.isDirectory ? (
            <>
              {expandedFolders.has(item.path) ? (
                <ChevronDown className="w-4 h-4 mr-1 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />
              )}
              <Folder className="w-4 h-4 mr-2 text-blue-400" />
            </>
          ) : (
            <File className="w-4 h-4 mr-2 ml-5 text-gray-400" />
          )}
          <span className="text-sm text-gray-200 truncate">{item.name}</span>
        </div>
        {item.isDirectory && expandedFolders.has(item.path) && (
          <FileTreeSubfolder path={item.path} level={level + 1} onFileSelect={onFileSelect} />
        )}
      </div>
    ));
  };

  return (
    <div className="h-full bg-gray-800 text-white overflow-y-auto">
      <div className="h-12 px-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <button
          onClick={() => loadDirectory('')}
          className="p-1 hover:bg-gray-700 rounded"
          title="Go to Projects root"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-2">
        {currentPath && (
          <div className="px-1 pb-2 text-xs text-gray-400 truncate">Projects/{currentPath}</div>
        )}
        {loading && <div className="text-center text-gray-400 py-4">Loading...</div>}
        {error && <div className="text-center text-red-400 py-4">{error}</div>}
        {!loading && !error && files.length === 0 && (
          <div className="text-center text-gray-400 py-4">No files found</div>
        )}
        {!loading && !error && files.length > 0 && renderFileTree(files)}
      </div>
    </div>
  );
}

// Subfolder component to handle nested directories
function FileTreeSubfolder({ 
  path, 
  level, 
  onFileSelect 
}: { 
  path: string; 
  level: number; 
  onFileSelect: (path: string) => void;
}) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDirectory();
  }, [path]);

  const loadDirectory = async () => {
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (err) {
      console.error('Failed to load subdirectory:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isDirectory) {
      toggleFolder(file.path);
    } else {
      onFileSelect(file.path);
    }
  };

  if (loading) {
    return <div className="ml-4 text-xs text-gray-500">Loading...</div>;
  }

  return (
    <>
      {files.map((item) => (
        <div key={item.path}>
          <div
            className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer rounded`}
            style={{ marginLeft: `${level * 16}px` }}
            onClick={() => handleFileClick(item)}
          >
            {item.isDirectory ? (
              <>
                {expandedFolders.has(item.path) ? (
                  <ChevronDown className="w-4 h-4 mr-1 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />
                )}
                <Folder className="w-4 h-4 mr-2 text-blue-400" />
              </>
            ) : (
              <File className="w-4 h-4 mr-2 ml-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-200 truncate">{item.name}</span>
          </div>
          {item.isDirectory && expandedFolders.has(item.path) && (
            <FileTreeSubfolder 
              path={item.path} 
              level={level + 1} 
              onFileSelect={onFileSelect} 
            />
          )}
        </div>
      ))}
    </>
  );
}
