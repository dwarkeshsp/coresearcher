# CoResearcher - AI-Powered Document Analysis Application

CoResearcher is a document research assistant built specifically for podcast interview preparation and research. It provides real-time document summarization, interactive chat, and automatic generation of study materials (flashcards and interview questions). Originally built for the Dwarkesh Podcast research workflow.

## Features

- **📁 File Browser**: Navigate and select local markdown and text files from Projects folder
- **✏️ Document Editor**: Edit documents with syntax highlighting using CodeMirror
- **💬 AI Chat**: Real-time streaming chat with document context
- **🎯 Auto Summary**: Automatic document summarization when you open a file
- **📇 Flashcards**: Andy Matuschak-style spaced repetition cards
- **🎤 Interview Questions**: Generate deep, thought-provoking podcast interview questions
- **⚡ Parallel Processing**: Summary, flashcards, and questions generate simultaneously
- **🛑 Stop Button**: Interrupt AI streaming at any time and continue conversation

## Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Anthropic API key

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/coresearcher-2.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings (should auto-detect Next.js):
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Set Environment Variables

In Vercel project settings, add:
- `ANTHROPIC_API_KEY` = your_api_key_here

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

### Important Notes for Production

⚠️ **File System Access**: The current implementation uses local file system access which won't work on Vercel. For production, you'll need to:
- Use a cloud storage solution (S3, Google Cloud Storage)
- Or implement client-side file handling
- Or use a database for document storage

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coresearcher-2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

## Running the Application

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Browse Files**: Use the left panel to navigate your local file system
2. **Select a Document**: Click on any `.md` or `.txt` file to open it
3. **Automatic Analysis**: The AI will immediately start:
   - Streaming a comprehensive summary in the chat
   - Generating flashcards in the background
   - Creating study questions in parallel
4. **Interactive Chat**: Ask follow-up questions about the document
5. **Study Materials**: Switch between Chat, Flashcards, and Questions tabs

## Architecture

```
Frontend (Next.js)
├── File Browser (left panel)
├── Document Editor (center panel)
└── AI Interface (right panel)
    ├── Chat Tab (with streaming)
    ├── Flashcards Tab
    └── Questions Tab

Backend (Next.js API Routes)
├── /api/files - File system operations
├── /api/chat - SSE streaming for chat
└── /api/generate - Flashcard/question generation

AI Service
└── Claude 3.5 Sonnet (Anthropic)
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **CodeMirror 6**: Advanced code editor
- **Anthropic Claude Opus 4.1**: Latest AI model (claude-opus-4-1-20250805)
- **Server-Sent Events**: Real-time streaming
- **Lucide Icons**: Beautiful icon set

## Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Limitations

- Currently supports only `.md` and `.txt` files
- File editing is local only (no save functionality yet)
- Requires active internet connection for AI features
- API rate limits apply based on your Anthropic plan

## Future Enhancements

- [ ] Save edited documents
- [ ] Support for PDF files
- [ ] Export flashcards to Anki format
- [ ] Persistent chat history
- [ ] Multiple document tabs
- [ ] Customizable AI prompts
- [ ] Offline mode with cached responses

## Project Development Summary

### What We Built
CoResearcher started as a general document analysis tool and evolved into a specialized research assistant for podcast interview preparation. The app helps analyze documents and generate thoughtful interview questions in the style of the Dwarkesh Podcast.

### Key Implementation Details

#### 1. **Three-Panel Layout**
- Left: File browser limited to `Projects/` folder for organization
- Center: CodeMirror editor with markdown syntax highlighting
- Right: AI panel with Chat, Flashcards, and Questions tabs

#### 2. **AI Integration**
- Model: claude-opus-4-1-20250805
- Streaming responses using Server-Sent Events
- Parallel generation of summaries, flashcards, and questions
- Custom prompts tailored for podcast research

#### 3. **Major Issues Fixed**
- **Initial Load Bug**: Separated file path and content effects to ensure generation starts on first file open
- **Chat Glitching**: Added proper file tracking to prevent re-summarization on every edit
- **Folder Navigation**: Fixed dropdown to expand without changing directory
- **Stop Functionality**: Added ability to interrupt streaming and continue conversation
- **Question Format**: Changed from Q&A format to interview-style questions only

#### 4. **Custom Prompts**
Prompts were customized specifically for the Dwarkesh Podcast workflow:
- Simple, direct summary prompt
- Andy Matuschak-style flashcards for spaced repetition
- Interview questions with examples from actual podcast episodes (Kotkin, Church, Karpathy)

#### 5. **File Structure**
```
app/
├── api/
│   ├── chat/route.ts        # SSE streaming chat endpoint
│   ├── files/route.ts       # File system operations
│   └── generate/route.ts    # Flashcard/question generation
├── layout.tsx
└── page.tsx                  # Main app with state management

components/
├── AIPanel.tsx              # Chat, flashcards, questions UI
├── Editor.tsx               # CodeMirror markdown editor
└── FileBrowser.tsx          # File navigation component

lib/
├── anthropic.ts             # Claude client setup
└── prompts.ts               # All AI prompts (customized for podcast)

Projects/                    # User documents go here
└── sergey-levine/          # Example research folder
```

### State Management
- Lifted state in main page.tsx
- Document content flows: FileBrowser → Editor → AIPanel
- Proper cleanup of abort controllers for streaming
- Debouncing to prevent excessive regeneration

### Known Limitations for Production
1. **File System**: Current implementation uses Node.js fs module which won't work on Vercel
2. **No Save**: Editor changes aren't persisted to disk
3. **No Auth**: No user authentication or multi-tenancy
4. **API Keys**: Each user needs their own Anthropic API key

### Potential Enhancements
- Cloud storage integration (S3/GCS) for production deployment
- Save functionality for edited documents
- Export interview questions to various formats
- Multi-document context for AI
- Voice transcription for interview prep
- Integration with podcast recording tools

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
