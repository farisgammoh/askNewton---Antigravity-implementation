import { storage } from "../storage";

type LogOpenAICallParams = {
  endpoint: string;
  model: string;
  tokensPrompt?: number;
  tokensCompletion?: number;
  costUsd?: number;
};

export async function logOpenAICall({
  endpoint,
  model,
  tokensPrompt,
  tokensCompletion,
  costUsd,
}: LogOpenAICallParams): Promise<void> {
  try {
    const storageInstance = await storage();
    await storageInstance.createOpenAICallLog({
      endpoint,
      model,
      tokensPrompt: tokensPrompt?.toString(),
      tokensCompletion: tokensCompletion?.toString(),
      costUsd: costUsd?.toString(),
    });
  } catch (err) {
    console.error("Failed to log OpenAI call", err);
  }
}
