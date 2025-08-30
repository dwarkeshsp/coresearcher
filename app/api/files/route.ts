// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestPath = searchParams.get('path') || '';
    const type = searchParams.get('type') || 'list';
    
    // Use Projects folder in current directory as base
    const projectsDir = path.join(process.cwd(), 'Projects');
    
    // Ensure Projects directory exists
    try {
      await fs.access(projectsDir);
    } catch {
      await fs.mkdir(projectsDir, { recursive: true });
    }
    
    const fullPath = path.resolve(projectsDir, requestPath);
    
    // Basic path traversal protection
    if (!fullPath.startsWith(projectsDir)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (type === 'list') {
      // List directory contents
      try {
        const stats = await fs.stat(fullPath);
        
        if (!stats.isDirectory()) {
          return NextResponse.json({ error: 'Path is not a directory' }, { status: 400 });
        }

        const files = await fs.readdir(fullPath);
        const fileList = await Promise.all(
          files
            .filter(file => !file.startsWith('.')) // Filter hidden files
            .map(async (file) => {
              const filePath = path.join(fullPath, file);
              try {
                const stat = await fs.stat(filePath);
                return {
                  name: file,
                  path: path.relative(projectsDir, filePath),
                  isDirectory: stat.isDirectory(),
                };
              } catch {
                return null;
              }
            })
        );

        const validFiles = fileList.filter(Boolean);
        // Sort: directories first, then alphabetically
        validFiles.sort((a, b) => {
          if (a!.isDirectory !== b!.isDirectory) {
            return a!.isDirectory ? -1 : 1;
          }
          return a!.name.localeCompare(b!.name);
        });

        return NextResponse.json(validFiles);
      } catch (error) {
        return NextResponse.json({ error: 'Failed to list directory' }, { status: 500 });
      }
    } else if (type === 'read') {
      // Read file contents
      try {
        const stats = await fs.stat(fullPath);
        
        if (!stats.isFile()) {
          return NextResponse.json({ error: 'Path is not a file' }, { status: 400 });
        }

        // Only read text files and markdown
        const ext = path.extname(fullPath).toLowerCase();
        if (!['.md', '.txt', '.text', '.markdown'].includes(ext)) {
          return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        const content = await fs.readFile(fullPath, 'utf-8');
        return NextResponse.json({ content, path: requestPath });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('File API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
