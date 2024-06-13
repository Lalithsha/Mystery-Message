/* import OpenAI from "openai";

import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: Request){
    const {messages} = await req.json()
}

const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
})
 */

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { generateText } from 'ai';
//import 
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
      
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment"

    const { messages } = await req.json();

  
    const result = await streamText({
      model: openai('gpt-3.5-turbo'), // gpt-4-turbo
      prompt,
      messages,
    });

    /* const result = await generateText({
        model: openai('gpt-3.5-turbo'),
        messages,
        prompt,
      }); */

      /* const response = await openai.completions.create({
        model: openai('gpt-3.5-turbo'),
        messages,
        prompt,
      }) */
      
  
    return result.toAIStreamResponse();

  } catch (error) {

    if(error instanceof OpenAI.APIError){
        const {name, status, headers, message} = error
        return NextResponse.json({
            name, status, headers, message
        }, {status})
    } 
    else {
        console.error("An unexpected error occured  ", error);
        throw error
    }
  }
}
