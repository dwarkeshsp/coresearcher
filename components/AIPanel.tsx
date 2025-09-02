// components/AIPanel.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, CreditCard, HelpCircle, Send, Loader2, Square, ChevronDown } from 'lucide-react';
import { Message } from '@/lib/anthropic';

interface Flashcard {
  front: string;
  back: string;
}

interface Question {
  question: string;
}

interface AIPanelProps {
  documentContent: string;
  filePath: string | null;
}

export default function AIPanel({ documentContent, filePath }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'flashcards' | 'questions'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  // For fade-in of only the most recent characters
  const [streamBase, setStreamBase] = useState('');
  const [streamFresh, setStreamFresh] = useState('');
  const [hasGeneratedForFile, setHasGeneratedForFile] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFilePathRef = useRef<string | null>(null);
  // Typewriter streaming refs
  const pendingRef = useRef<string>('');
  const displayRef = useRef<string>('');
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef<boolean>(false);

  useEffect(() => {
    // Only trigger when we switch to a different file
    if (filePath && filePath !== lastFilePathRef.current) {
      // Abort any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      
      // Reset state for new document
      setMessages([]);
      setFlashcards([]);
      setQuestions([]);
      setCurrentStreamingMessage('');
      setHasGeneratedForFile(filePath);
      lastFilePathRef.current = filePath;
    }
  }, [filePath]);

  // Separate effect for content generation to ensure it triggers properly
  useEffect(() => {
    if (filePath && documentContent && filePath === lastFilePathRef.current) {
      // Start summary generation
      generateSummary();
      
      // Generate flashcards and questions in parallel
      generateStudyMaterials();
    }
  }, [filePath, documentContent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Typewriter helpers
  const cancelTyping = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const resetTyping = () => {
    cancelTyping();
    pendingRef.current = '';
    displayRef.current = '';
    doneRef.current = false;
    setStreamBase('');
    setStreamFresh('');
  };

  const startTypingLoop = () => {
    if (rafRef.current) return;
    const tick = () => {
      const take = Math.min(6, pendingRef.current.length); // chars per frame
      if (take > 0) {
        const next = pendingRef.current.slice(0, take);
        pendingRef.current = pendingRef.current.slice(take);
        const prev = displayRef.current;
        displayRef.current = prev + next;
        setStreamBase(prev);
        setStreamFresh(next);
        setCurrentStreamingMessage(displayRef.current);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      // Buffer empty
      rafRef.current = null;
      if (doneRef.current) {
        // Finalize message
        setMessages([{ role: 'assistant', content: displayRef.current }]);
        displayRef.current = '';
        setCurrentStreamingMessage('');
        doneRef.current = false;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const toggleCard = (index: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      // Flush any pending/typed text
      cancelTyping();
      const partial = (displayRef.current || '') + (pendingRef.current || '');
      pendingRef.current = '';
      displayRef.current = '';
      if (partial) {
        setMessages(prev => [...prev, { role: 'assistant', content: partial }]);
        setCurrentStreamingMessage('');
      }
      setStreamBase('');
      setStreamFresh('');
      setIsStreaming(false);
    }
  }, []);

  const generateSummary = async () => {
    if (!documentContent) return;
    
    setIsStreaming(true);
    resetTyping();
    setCurrentStreamingMessage('');
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Please summarize this document.' }],
          documentContent,
          isInitialSummary: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Failed to generate summary');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulatedMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              doneRef.current = true;
              if (!rafRef.current && pendingRef.current.length === 0) {
                // Nothing left to type; finalize immediately
                setMessages([{ role: 'assistant', content: displayRef.current }]);
                displayRef.current = '';
                setCurrentStreamingMessage('');
                setStreamBase('');
                setStreamFresh('');
                doneRef.current = false;
              }
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  // Accumulate and ensure typing loop is running
                  pendingRef.current += parsed.text;
                  startTypingLoop();
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Streaming error:', error);
        setMessages([{ role: 'assistant', content: 'Failed to generate summary. Please try again.' }]);
      }
    } finally {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const generateStudyMaterials = async () => {
    if (!documentContent) return;
    
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: documentContent }),
      });

      if (!response.ok) throw new Error('Failed to generate study materials');

      const data = await response.json();
      setFlashcards(data.flashcards || []);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !documentContent || isStreaming) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    const updatedMessages = [...messages, userMessage];
    if (currentStreamingMessage) {
      updatedMessages.push({ role: 'assistant', content: currentStreamingMessage });
      setCurrentStreamingMessage('');
    }
    setMessages(updatedMessages);
    setInputMessage('');
    setIsStreaming(true);
    resetTyping();

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          documentContent,
          isInitialSummary: false,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulatedMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              doneRef.current = true;
              if (!rafRef.current && pendingRef.current.length === 0) {
                setMessages([...updatedMessages, { role: 'assistant', content: displayRef.current }]);
                displayRef.current = '';
                setCurrentStreamingMessage('');
                setStreamBase('');
                setStreamFresh('');
                doneRef.current = false;
              }
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  pendingRef.current += parsed.text;
                  startTypingLoop();
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Chat error:', error);
        setMessages([...updatedMessages, { role: 'assistant', content: 'Failed to send message. Please try again.' }]);
      }
    } finally {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const renderChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`w-full rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="prose prose-sm prose-invert max-w-none">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {currentStreamingMessage && (
          <div className="flex justify-start">
            <div className="w-full rounded-lg px-4 py-2 bg-gray-700 text-gray-100">
              <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
                <span>{streamBase}</span>
                <span key={streamBase.length} className="fade-in">{streamFresh}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (isStreaming) {
                  stopStreaming();
                } else if (inputMessage.trim()) {
                  sendMessage();
                }
              }
            }}
            placeholder="Ask about the document..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!documentContent}
          />
          <button
            onClick={isStreaming ? stopStreaming : sendMessage}
            disabled={!documentContent || (!isStreaming && !inputMessage.trim())}
            className={`${
              isStreaming 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            title={isStreaming ? 'Stop generating' : 'Send message'}
          >
            {isStreaming ? <Square className="w-4 h-4" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFlashcards = () => (
    <div className="h-full p-4 overflow-y-auto">
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Generating flashcards...</span>
        </div>
      ) : flashcards.length > 0 ? (
        <div className="space-y-4">
          {flashcards.map((card, index) => (
            <div key={index} className="bg-gray-700 rounded-lg">
              <button
                onClick={() => toggleCard(index)}
                className="w-full flex items-start justify-between gap-3 px-4 py-3 hover:bg-gray-650 rounded-t-lg text-left"
                aria-expanded={expandedCards.has(index)}
              >
                <div className="flex-1">
                  <span className="text-xs text-gray-400 uppercase">Front</span>
                  <p className="text-white mt-1">{card.front}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 mt-1 transition-transform ${expandedCards.has(index) ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedCards.has(index) && (
                <div className="border-t border-gray-600 px-4 py-3 rounded-b-lg">
                  <span className="text-xs text-gray-400 uppercase">Back</span>
                  <p className="text-gray-300 mt-1">{card.back}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          {documentContent ? 'No flashcards generated yet' : 'Select a document to generate flashcards'}
        </div>
      )}
    </div>
  );

  const renderQuestions = () => (
    <div className="h-full p-4 overflow-y-auto">
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Generating interview questions...</span>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-3">
          <div className="mb-4 text-sm text-gray-400">
            Interview questions for your podcast:
          </div>
          {questions.map((q, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-semibold mt-0.5">{index + 1}.</span>
                <p className="text-white flex-1">{q.question}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          {documentContent ? 'No questions generated yet' : 'Select a document to generate interview questions'}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="h-12 flex border-b border-gray-700 items-stretch">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 text-sm font-medium transition-colors h-full ${
            activeTab === 'chat'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 text-sm font-medium transition-colors h-full ${
            activeTab === 'flashcards'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Flashcards
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 text-sm font-medium transition-colors h-full ${
            activeTab === 'questions'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Questions
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'flashcards' && renderFlashcards()}
        {activeTab === 'questions' && renderQuestions()}
      </div>
    </div>
  );
}
