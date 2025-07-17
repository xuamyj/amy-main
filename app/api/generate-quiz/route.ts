import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { scenario, outcome } = await request.json();

    const prompt = `Generate a personality quiz with the following structure:

Scenario: "Live a day as ${scenario}"
Goal: "and we'll tell you ${outcome}"

Please generate:
1. Exactly 5 possible results (categories related to "${outcome}")
2. Exactly 7 quiz questions that would help determine which result fits best
3. For each question, exactly 6 answer options that aren't too obvious
4. For each answer, specify which results it gives points to and how many points (1-3 points each)

Format your response as JSON with this exact structure:
{
  "results": [
    { "id": 1, "name": "Result Name", "description": "Brief description" }
  ],
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "answers": [
        {
          "id": 1,
          "text": "Answer text",
          "points": { "1": 2, "3": 1 }
        }
      ]
    }
  ]
}

The points object should map result IDs to point values. Make sure the questions are engaging and the answers feel natural, not obviously pointing to specific outcomes.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        const quizData = JSON.parse(content.text);
        return NextResponse.json(quizData);
      } catch (parseError) {
        return NextResponse.json({ 
          error: 'Failed to parse response', 
          rawResponse: content.text 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 });

  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}