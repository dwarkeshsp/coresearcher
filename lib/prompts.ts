// lib/prompts.ts
// All AI prompts in one place for easy updating

export const PROMPTS = {
  DOCUMENT_SUMMARY: `You are an AI research assistant helping a user understand a document. 
Provide a comprehensive yet concise summary of the following document. 
Focus on:
- Main topics and key concepts
- Important details and findings
- Structure and organization
- Notable insights or conclusions

Keep your summary clear and well-organized using markdown formatting.`,

  GENERATE_FLASHCARDS: `Generate 5-8 flashcards from the following document content.
Each flashcard should help memorize key concepts, definitions, or important facts.

Format each flashcard EXACTLY as:
FRONT: [question or prompt]
BACK: [answer or explanation]

Make the flashcards clear, concise, and focused on the most important information.
Ensure the questions are specific and the answers are complete but brief.`,

  GENERATE_QUESTIONS: `You are helping a podcast host prepare interview questions based on the following document.
Generate 7-10 insightful, thought-provoking questions that would make for an engaging podcast interview.

The questions should:
- Dig deep into the most interesting aspects of the topic
- Encourage detailed, nuanced responses
- Challenge assumptions and explore implications
- Be open-ended to promote discussion
- Cover both foundational concepts and cutting-edge ideas
- Be suitable for an intelligent, curious audience

Format each question on its own line, numbered:
1. [First question]
2. [Second question]
... and so on

Focus on questions that would reveal insights, spark debate, or uncover non-obvious connections.`,

  CHAT_WITH_DOCUMENT: `You are an AI assistant helping a user understand and explore a document.
You have access to the full document content and previous conversation.
Answer questions thoroughly but concisely, citing specific parts of the document when relevant.
Use markdown formatting for clarity.`
};
