// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import anthropic from '@/lib/anthropic';
import { PROMPTS } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { messages, documentContent, isInitialSummary } = await request.json();

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Prepare the system prompt
          let systemPrompt = PROMPTS.CHAT_WITH_DOCUMENT;
          
          if (isInitialSummary) {
            systemPrompt = PROMPTS.DOCUMENT_SUMMARY;
          }
          
          if (documentContent) {
            systemPrompt += `\n\nDocument content:\n${documentContent}`;
          }

          // Create the message stream
          const messageStream = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            system: systemPrompt,
            messages: messages || [{ role: 'user', content: 'Please summarize this document.' }],
            stream: true,
          });

          // Stream the response
          for await (const chunk of messageStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
