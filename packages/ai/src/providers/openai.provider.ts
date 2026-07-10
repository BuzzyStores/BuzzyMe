import type { AiDraftRequest, AiDraftResult, AiProvider } from "../index";

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";

  async createDraft(_request: AiDraftRequest): Promise<AiDraftResult> {
    throw new Error("OpenAI provider is intentionally not wired in the foundation scaffold.");
  }
}
