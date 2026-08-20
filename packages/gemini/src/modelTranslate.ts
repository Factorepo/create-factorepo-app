import type {
  Content,
  FunctionDeclaration,
  GenerateContentResponse,
  Part,
  Schema,
} from "@google/genai";
import { Type } from "@google/genai";

import type {
  ModelChunk,
  ModelPart,
  ModelResponse,
  ModelToolCall,
  ModelTurn,
  ModelUsage,
  SchemaNode,
  ToolDeclaration,
} from "./modelSession";

const SCHEMA_TYPE = {
  object: Type.OBJECT,
  array: Type.ARRAY,
  string: Type.STRING,
  integer: Type.INTEGER,
};

export const modelTranslate = {
  // Justification: every `SchemaNode` kind returns, and the compiler proves it.
  // oxlint-disable-next-line typescript/consistent-return
  toSchema(node: SchemaNode): Schema {
    const described = node.description ? { description: node.description } : {};

    switch (node.kind) {
      case "object":
        return {
          type: SCHEMA_TYPE.object,
          ...described,
          properties: Object.fromEntries(
            Object.entries(node.properties).map(([name, property]) => [
              name,
              modelTranslate.toSchema(property),
            ]),
          ),
          ...(node.required && { required: node.required }),
        };
      case "array":
        return {
          type: SCHEMA_TYPE.array,
          ...described,
          items: modelTranslate.toSchema(node.items),
        };
      case "string":
        return { type: SCHEMA_TYPE.string, ...described };
      case "integer":
        return { type: SCHEMA_TYPE.integer, ...described };
    }
  },

  toTools(declarations: ToolDeclaration[]): FunctionDeclaration[] {
    return declarations.map((declaration) => ({
      name: declaration.name,
      description: declaration.description,
      parameters: modelTranslate.toSchema(declaration.parameters),
    }));
  },

  /**
   * Identity, and deliberately so.
   *
   * `ModelPart` is declared as the shape the stored history already holds, so a
   * part crosses unchanged. Rebuilding it field by field would drop whatever the
   * model attached that this package does not model — a thought signature among
   * them — and a replayed history needs those fields back verbatim.
   */
  toParts(parts: ModelPart[]): Part[] {
    return parts as Part[];
  },

  fromParts(parts: Part[]): ModelPart[] {
    return parts as ModelPart[];
  },

  toContents(turns: ModelTurn[]): Content[] {
    return turns.map((turn) => ({
      role: turn.role,
      parts: modelTranslate.toParts(turn.parts),
    }));
  },

  fromContents(contents: Content[]): ModelTurn[] {
    return contents.map((content) => ({
      role: content.role ?? "user",
      parts: modelTranslate.fromParts(content.parts ?? []),
    }));
  },

  toolCalls(response: GenerateContentResponse): ModelToolCall[] {
    return (response.functionCalls ?? []).map((call) => ({
      ...(call.id !== undefined && { id: call.id }),
      name: call.name ?? "unknown",
      args: call.args ?? {},
    }));
  },

  usage(response: GenerateContentResponse): ModelUsage {
    return {
      inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    };
  },

  fromResponse(response: GenerateContentResponse): ModelResponse {
    return {
      text: response.text ?? "",
      toolCalls: modelTranslate.toolCalls(response),
      usage: modelTranslate.usage(response),
    };
  },

  /**
   * `usage` marks the closing chunk. The stream reports the candidate token
   * count once, on the last chunk of a round, which is the only signal the SDK
   * gives that the round is over.
   */
  fromChunk(chunk: GenerateContentResponse): ModelChunk {
    const closing = !!chunk.usageMetadata?.candidatesTokenCount;

    return {
      ...(chunk.text !== undefined && { text: chunk.text }),
      toolCalls: modelTranslate.toolCalls(chunk),
      ...(closing && { usage: modelTranslate.usage(chunk) }),
    };
  },
};
