# CoResearcher - AI-Powered Document Analysis Application

CoResearcher is a local document research assistant that helps users deeply understand documents through AI-powered analysis. It provides real-time document summarization, interactive chat, and automatic generation of study materials (flashcards and questions).

## Features

- **📁 File Browser**: Navigate and select local markdown and text files
- **✏️ Document Editor**: Edit documents with syntax highlighting using CodeMirror
- **💬 AI Chat**: Real-time streaming chat with document context
- **🎯 Auto Summary**: Automatic document summarization when you open a file
- **📇 Flashcards**: Auto-generated flashcards for key concepts
- **❓ Study Questions**: Comprehensive questions to test understanding
- **⚡ Parallel Processing**: Summary, flashcards, and questions generate simultaneously

## Prerequisites

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
- **Anthropic Claude**: AI model for analysis
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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
