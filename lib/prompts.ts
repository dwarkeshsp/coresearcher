// lib/prompts.ts
// All AI prompts in one place for easy updating

export const PROMPTS = {
  DOCUMENT_SUMMARY: `Summarize this document`,

  GENERATE_FLASHCARDS: `Generate 5-8 flashcards. Be very concise. 
  I'm targetting Andy Matushak's style for making spaced repetition study cards.
  I want to understand both how things work at a high level but also the implementation details.

Format each flashcard EXACTLY as:
FRONT: [question or prompt]
BACK: [answer or explanation]

`,

  GENERATE_QUESTIONS: `What should I ask the author of this document when I interview them?
  I'm gonna interview them on a really smart podcast (Dwarkesh Podcast).
  I like to ask the most interesting questions. 
  Not questions that are easy to answer.

  Here's some examples:
  From my interview of Stephen Kotkin:
  1. If Bolsheviks don’t take power in Russia, does Communism just not become a historical force. Maybe Europe still goes social democratic, but you don’t have brutal leftist dictators take control in China, North Korea, parts of Africa and South America? Or do you think this kind of Marxist-Leninist political philosophy is enough of an attractor state that it would have arisen independently?
  2. Why doesn’t communism have a bigger impact on the longer run growth trajectory of Russia? Do you suspect that without communism, Russia might have been hyperbolic instead? Do you think without communism, due its large population (1.29x US in 1939) and resources, Russia might have ended up with a bigger economy than even America (which it never had during the real Cold War).
  From my interview of George Church:
  1. Over the last 3 decades, we’ve seen a million-fold reduction in genome sequencing costs, 1000-fold decrease in DNA synthesis costs, the development of precise gene editing tools like CRISPR, and the ability to conduct massively parallel experiments through multiplexing techniques. And of course, your lab has been responsible for much of this progress. But it doesn't seem like we're curing diseases or coming up with new treatments at a faster rate now than we were 30 years ago. If anything, drug development is slowing down. Whereas with Moore's Law - look here’s my iPhone. What explains what is going on here?
  From my interview of Andrej Karpathy:
  1. What learning paradigm are humans using? Is it RL? Have we even invented it yet? We can learn autonomously just by practicing/thinking about a task even when there is no explicit reward. Think about what’s happening to an employee as she’s upskilling in her first 6 months on the job. What exactly is the ML analogue for what’s happening here - In context learning? System prompt updating? Something we haven’t invented yet? 
  2. How much should we read into the fact that Grok 4 was supposedly trained on an equivalent amount of pre-training and RL compute? Scaling laws for RL have always been notoriously bleak (AlphaGo Zero used similar amounts of compute as GPT-3 while being far less general). You get so little signal for so much work. Are we already hitting steeply plateauing returns in this paradigm? Or does this just suggest that we need better RL environments before we can scale up compute?



Format each question on its own line, numbered:
1. [First question]
2. [Second question]
... and so on

`,

  CHAT_WITH_DOCUMENT: `You are a very smart AI assistant helping a user understand and explore a document.
You have access to the full document content and previous conversation.
Feel free to rely on your own knowledge, not just the document.`
};
