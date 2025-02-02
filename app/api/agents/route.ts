import agentsConfig from '@/config/agents';
import { MultiAgentSystem } from '@/lib/agent';
import { NextResponse } from 'next/server';

const system = new MultiAgentSystem(agentsConfig);

export async function POST(req: Request) {
  try {
    const { prompt, agentType } = await req.json();

    if (!prompt || !agentType) {
      return NextResponse.json(
        { error: 'Missing prompt or agent type' },
        { status: 400 }
      );
    }

    if (!agentsConfig.agents[agentType as keyof typeof agentsConfig.agents]) {
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
