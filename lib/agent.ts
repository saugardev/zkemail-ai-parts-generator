import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/src/resources/messages/messages.js';

interface AgentConfig {
  name: string;
  role: string;
  systemPrompt?: string;
}

export class Agent {
  private name: string;
  private role: string;
  private client: Anthropic;
  private conversationHistory: MessageParam[];
  private systemPrompt: string;

  constructor(
    config: AgentConfig,
    client: Anthropic
  ) {
    this.name = config.name;
    this.role = config.role;
    this.client = client;
    this.conversationHistory = [];
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();
  }

  private getDefaultSystemPrompt(): string {
    return `You are ${this.name}, a ${this.role}. Respond concisely and stay in character.`;
  }

  async think(message: string): Promise<string> {
    try {
      const messages: MessageParam[] = [
        {
          role: 'user',
          content: message
        }
      ];

      if (this.conversationHistory.length > 0) {
        const recentHistory = this.conversationHistory.slice(-5);
        messages.unshift(...recentHistory);
      }

      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0,
        system: `You are ${this.name}, a ${this.role}. Respond concisely and stay in character. ${this.systemPrompt}`,
        messages: messages
      });

      const content = response.content[0];
      const reply = content.type === 'text' ? content.text : '';

      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: reply }
      );

      return reply;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic API Error: ${error.message}`);
      }
      throw error;
    }
  }

  getConversationHistory(): MessageParam[] {
    return [...this.conversationHistory];
  }
}

interface DiscussionResult {
  messages: string[];
  error?: string;
}

interface ClientConfig {
  type: 'anthropic';
  apiKey: string;
}

interface SystemConfig {
  client: ClientConfig;
  agents: Record<string, AgentConfig>;
}

export class MultiAgentSystem {
  private agents: Map<string, Agent>;
  private client: Anthropic;
  
  constructor(config: SystemConfig) {
    this.client = new Anthropic({ apiKey: config.client.apiKey });
    this.agents = new Map();
    
    Object.entries(config.agents).forEach(([name, agentConfig]) => {
      const agent = new Agent(agentConfig, this.client);
      this.agents.set(name, agent);
    });
  }

  async facilitateDiscussion(
    topic: string,
    rounds: number = 3,
    delayMs: number = 1000
  ): Promise<DiscussionResult> {
    const discussion: string[] = [];
    let currentMessage = topic;

    try {
      for (let round = 0; round < rounds; round++) {
        for (const [agentName, agent] of this.agents) {
          if (discussion.length > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }

          const response = await agent.think(currentMessage);
          const formattedResponse = `${agentName}: ${response}`;
          discussion.push(formattedResponse);
          currentMessage = response;
        }
      }

      return { messages: discussion };

    } catch (error) {
      return {
        messages: discussion,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async chainAgents(
    initialPrompt: string, 
    agentSequence: string[]
  ): Promise<string[]> {
    const responses: string[] = [];
    let currentMessage = initialPrompt;

    for (const agentName of agentSequence) {
      const agent = this.agents.get(agentName);
      if (!agent) {
        throw new Error(`Agent ${agentName} not found`);
      }

      const response = await agent.think(currentMessage);
      responses.push(`${agentName}: ${response}`);
      currentMessage = response;
    }

    return responses;
  }
}
