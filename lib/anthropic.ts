// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client with API key from environment
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default anthropic;

// Helper type for messages
export type Message = {
  role: 'user' | 'assistant';
  content: string;
};
