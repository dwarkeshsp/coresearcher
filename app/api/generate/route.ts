// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import anthropic from '@/lib/anthropic';
import { PROMPTS } from '@/lib/prompts';

interface Flashcard {
  front: string;
  back: string;
}

interface Question {
  question: string;
  answer: string;
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    // Run both generations in parallel
    const [flashcardsResponse, questionsResponse] = await Promise.all([
      // Generate flashcards
      anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: PROMPTS.GENERATE_FLASHCARDS,
        messages: [{ role: 'user', content }],
      }),
      // Generate questions
      anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: PROMPTS.GENERATE_QUESTIONS,
        messages: [{ role: 'user', content }],
      }),
    ]);

    // Parse flashcards
    const flashcardsText = flashcardsResponse.content[0].type === 'text' 
      ? flashcardsResponse.content[0].text 
      : '';
    const flashcards: Flashcard[] = [];
    const flashcardLines = flashcardsText.split('\n');
    let currentFlashcard: Partial<Flashcard> = {};
    
    for (const line of flashcardLines) {
      if (line.startsWith('FRONT:')) {
        if (currentFlashcard.front && currentFlashcard.back) {
          flashcards.push(currentFlashcard as Flashcard);
        }
        currentFlashcard = { front: line.replace('FRONT:', '').trim() };
      } else if (line.startsWith('BACK:')) {
        currentFlashcard.back = line.replace('BACK:', '').trim();
      }
    }
    
    if (currentFlashcard.front && currentFlashcard.back) {
      flashcards.push(currentFlashcard as Flashcard);
    }

    // Parse questions
    const questionsText = questionsResponse.content[0].type === 'text'
      ? questionsResponse.content[0].text
      : '';
    const questions: Question[] = [];
    const questionLines = questionsText.split('\n');
    let currentQuestion: Partial<Question> = {};
    let inAnswer = false;
    
    for (const line of questionLines) {
      if (line.startsWith('Q:')) {
        if (currentQuestion.question && currentQuestion.answer) {
          questions.push(currentQuestion as Question);
        }
        currentQuestion = { question: line.replace('Q:', '').trim(), answer: '' };
        inAnswer = false;
      } else if (line.startsWith('A:')) {
        currentQuestion.answer = line.replace('A:', '').trim();
        inAnswer = true;
      } else if (inAnswer && currentQuestion.answer && line.trim()) {
        currentQuestion.answer += ' ' + line.trim();
      }
    }
    
    if (currentQuestion.question && currentQuestion.answer) {
      questions.push(currentQuestion as Question);
    }

    return NextResponse.json({ flashcards, questions });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
