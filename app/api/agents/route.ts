import { MultiAgentSystem, Agent } from '@/lib/agent';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const system = new MultiAgentSystem();

// Initialize agents
const agents = {
  promptRefiner: new Agent({
    name: "promptRefiner",
    role: "prompt engineering expert",
    systemPrompt: "You are a prompt engineering expert. Your job is to refine and improve prompts to get better results from AI models. Focus on clarity, specificity, and proper constraints."
  }, client),
  
  partsExtractor: new Agent({
    name: "partsExtractor",
    role: "text analysis specialist",
    systemPrompt: "You are a text analysis specialist. Extract and organize key components from text into structured formats. Focus on identifying patterns and meaningful segments."
  }, client),
  
  regexGenerator: new Agent({
    name: "regexGenerator",
    role: "regex pattern expert",
    systemPrompt: "You are a regex pattern expert. Create precise and efficient regular expressions based on requirements. Include explanations of pattern components."
  }, client)
};

// Add agents to system
Object.entries(agents).forEach(([name, agent]) => {
  system.addAgent(agent, name);
});

export async function POST(req: Request) {
  try {
    const { prompt, agentType } = await req.json();

    if (!prompt || !agentType) {
      return NextResponse.json(
        { error: 'Missing prompt or agent type' },
        { status: 400 }
      );
    }

    if (!agents[agentType as keyof typeof agents]) {
      return NextResponse.json(
        { error: 'Invalid agent type' },
        { status: 400 }
      );
    }

    const responses = await system.chainAgents(prompt, [agentType]);
    return NextResponse.json({ result: responses });
    
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
