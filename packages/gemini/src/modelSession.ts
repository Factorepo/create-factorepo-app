import type { Chat } from "@google/genai";

import { geminiClient } from "./geminiClient";
import { modelTranslate } from "./modelTranslate";

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ModelToolCall {
  id?: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ModelToolResult {
  id?: string;
  name: string;
  response: unknown;
}

/**
 * One part of one turn.
 *
 * These three shapes are what the stored history already holds. A chat row
 * written before this package existed is read back through these exact keys,
 * so a renamed field here empties every conversation in the database.
 */
export type ModelPart =
  | { text: string }
  | { functionCall: ModelToolCall }
  | { functionResponse: ModelToolResult };

export interface ModelTurn {
  /** "user" or "model". Widened, because the stored column holds free JSON. */
  role: string;
  parts: ModelPart[];
}

export interface ModelResponse {
  text: string;
  toolCalls: ModelToolCall[];
  usage: ModelUsage;
}

export interface ModelChunk {
  text?: string;
  toolCalls: ModelToolCall[];
  /** Present on the closing chunk of a stream only. */
  usage?: ModelUsage;
}

export type SchemaNode =
  | {
      kind: "object";
      properties: Record<string, SchemaNode>;
      required?: string[];
      description?: string;
    }
  | { kind: "array"; items: SchemaNode; description?: string }
  | { kind: "string"; description?: string }
  | { kind: "integer"; description?: string };

export interface ToolDeclaration {
  name: string;
  description: string;
  parameters: SchemaNode;
}

export interface ModelSessionOptions {
  model: string;
  systemInstruction: string;
  temperature: number;
  tools?: ToolDeclaration[];
  history?: ModelTurn[];
  /** Set to make the model answer with JSON that matches the node. */
  responseSchema?: SchemaNode;
}

export interface ModelSession {
  send(parts: ModelPart[]): Promise<ModelResponse>;
  stream(parts: ModelPart[]): AsyncGenerator<ModelChunk>;
  history(): ModelTurn[];
}

function open(options: ModelSessionOptions): Chat {
  return geminiClient.chats.create({
    model: options.model,
    ...(options.history && {
      history: modelTranslate.toContents(options.history),
    }),
    config: {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature,
      ...(options.tools && {
        tools: [
          { functionDeclarations: modelTranslate.toTools(options.tools) },
        ],
      }),
      ...(options.responseSchema && {
        responseMimeType: "application/json",
        responseSchema: modelTranslate.toSchema(options.responseSchema),
      }),
    },
  });
}

export const modelSession = {
  create(options: ModelSessionOptions): ModelSession {
    const chat = open(options);

    return {
      async send(parts: ModelPart[]): Promise<ModelResponse> {
        const response = await chat.sendMessage({
          message: modelTranslate.toParts(parts),
        });
        return modelTranslate.fromResponse(response);
      },

      async *stream(parts: ModelPart[]): AsyncGenerator<ModelChunk> {
        const stream = await chat.sendMessageStream({
          message: modelTranslate.toParts(parts),
        });
        for await (const chunk of stream) {
          yield modelTranslate.fromChunk(chunk);
        }
      },

      history(): ModelTurn[] {
        return modelTranslate.fromContents(chat.getHistory());
      },
    };
  },
};
