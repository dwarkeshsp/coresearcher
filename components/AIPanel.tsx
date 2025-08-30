// components/AIPanel.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, CreditCard, HelpCircle, Send, Loader2 } from 'lucide-react';
import { Message } from '@/lib/anthropic';

interface Flashcard {
  front: string;
  back: string;
}

interface Question {
  question: string;
  answer: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (filePath && documentContent) {
      // Reset state for new document
      setMessages([]);
      setFlashcards([]);
      setQuestions([]);
      setCurrentStreamingMessage('');
      
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

  const generateSummary = async () => {
    if (!documentContent) return;
    
    setIsStreaming(true);
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
              setMessages([{ role: 'assistant', content: accumulatedMessage }]);
              setCurrentStreamingMessage('');
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulatedMessage += parsed.text;
                  setCurrentStreamingMessage(accumulatedMessage);
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
              setMessages([...updatedMessages, { role: 'assistant', content: accumulatedMessage }]);
              setCurrentStreamingMessage('');
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulatedMessage += parsed.text;
                  setCurrentStreamingMessage(accumulatedMessage);
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
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
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
            <div className="max-w-[85%] rounded-lg px-4 py-2 bg-gray-700 text-gray-100">
              <div className="prose prose-sm prose-invert max-w-none">
                {currentStreamingMessage.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
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
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about the document..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isStreaming || !documentContent}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !documentContent || !inputMessage.trim()}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFlashcards = () => (
    <div className="p-4 overflow-y-auto">
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Generating flashcards...</span>
        </div>
      ) : flashcards.length > 0 ? (
        <div className="space-y-4">
          {flashcards.map((card, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="mb-2">
                <span className="text-xs text-gray-400 uppercase">Front</span>
                <p className="text-white mt-1">{card.front}</p>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <span className="text-xs text-gray-400 uppercase">Back</span>
                <p className="text-gray-300 mt-1">{card.back}</p>
              </div>
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
    <div className="p-4 overflow-y-auto">
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Generating questions...</span>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="mb-2">
                <span className="text-xs text-gray-400 uppercase">Question {index + 1}</span>
                <p className="text-white mt-1 font-medium">{q.question}</p>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <span className="text-xs text-gray-400 uppercase">Answer</span>
                <p className="text-gray-300 mt-1">{q.answer}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          {documentContent ? 'No questions generated yet' : 'Select a document to generate questions'}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
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
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
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
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
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
