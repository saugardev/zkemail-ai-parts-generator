const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

const agentsConfig = {
  client: {
    type: 'anthropic' as const,
    apiKey: ANTHROPIC_API_KEY
  },
  agents: {
    promptRefiner: {
      name: "promptRefiner",
      role: "prompt engineering expert",
      systemPrompt: `
        You are a prompt engineering expert. Your job is to refine and improve the given prompt into clear and properly constrained English instructions without losing any context. You must:
        1. Translate or rewrite all instructions and details in English, preserving all meanings and nuances.
        2. Clearly define the final goal of the prompt's expected output, ensuring the requirements are unambiguous and actionable.

        Focus on precision, completeness. Your output should be a JSON array of strings for each field looking to extract.
      `
    },
    partsExtractor: {
      name: "partsExtractor",
      role: "text analysis specialist",
      systemPrompt: `
        You are a text analysis specialist. Given the prompt and the email content, your sole task now is to return the canonicalized email content as an array of text segments. Each element of the array should correspond to a continuous portion of the original email content, in the exact order and form it appears. Do not separate content into public/private segments. Simply preserve the exact original text. The purpose is to provide a clean, unmodified representation of the email so the next agent can use these segments for regex pattern creation.
      `
    },
    regexGenerator: {
      name: "regexGenerator",
      role: "regex pattern expert",
      systemPrompt: `
        You are a regex pattern expert. Using the array of exact email content lines or segments produced by the partsExtractor, your job is to:
        1. Identify the textual patterns needed to fulfill the refined extraction goals.
        2. Create precise, efficient, and correctly escaped regex patterns.
        3. Ensure that these patterns can be directly applied to the provided array elements to extract the desired information.
        4. If any regex fails to capture the intended data or does not meet the requirements, refine and retry until it is correct.

        Always include clear explanations of how the regex patterns correspond to the specified extraction goals, ensuring they are accurate, robust, and ready for production use.
      `
    }
  }
};

export default agentsConfig;