/**
 * Isolated AI client wrapper using @google/genai SDK.
 * This is the ONLY file in the repository permitted to import @google/genai.
 */

import { GoogleGenAI } from "@google/genai";

export interface AiStreamOptions {
  prompt: string;
  systemInstruction?: string;
  signal?: AbortSignal;
}

export interface AiGenerateOptions {
  prompt: string;
  systemInstruction?: string;
  signal?: AbortSignal;
}

export interface AiClient {
  isConfigured(): boolean;
  generateStream(options: AiStreamOptions): AsyncIterable<string>;
  generateText(options: AiGenerateOptions): Promise<string>;
}

class GeminiSdkClient implements AiClient {
  private sdk: GoogleGenAI | null = null;
  private readonly modelName = "gemini-3.8-flash";

  constructor() {
    const key = process.env["GEMINI_API_KEY"]?.trim();
    if (key) {
      this.sdk = new GoogleGenAI({ apiKey: key });
    }
  }

  public isConfigured(): boolean {
    return this.sdk !== null;
  }

  /**
   * Streams content from Gemini with abort signal support.
   * @param options - Prompt, system instruction, and abort signal.
   * @returns AsyncIterable of string chunks.
   */
  public async *generateStream(options: AiStreamOptions): AsyncIterable<string> {
    if (!this.sdk) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const responseStream = await this.sdk.models.generateContentStream({
      model: this.modelName,
      contents: options.prompt,
      config: options.systemInstruction
        ? { systemInstruction: options.systemInstruction }
        : undefined,
    });

    for await (const chunk of responseStream) {
      if (options.signal?.aborted) break;
      const text = chunk.text;
      if (text) yield text;
    }
  }

  /**
   * Generates a single text response from Gemini.
   * @param options - Prompt and configuration options.
   * @returns Completed text output.
   */
  public async generateText(options: AiGenerateOptions): Promise<string> {
    if (!this.sdk) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const res = await this.sdk.models.generateContent({
      model: this.modelName,
      contents: options.prompt,
      config: options.systemInstruction
        ? { systemInstruction: options.systemInstruction }
        : undefined,
    });

    return res.text ?? "";
  }
}

/**
 * Default production AI client instance.
 */
export const defaultClient: AiClient = new GeminiSdkClient();
