# Provider Adapters Implementation Guide

## Introduction

Provider adapters are a critical component of the MCP server architecture, responsible for translating between the standardized MCP protocol and provider-specific APIs. This guide details the implementation approach for provider adapters, focusing on the adapter interface, implementation patterns, error handling, credential management, and response normalization.

The guide includes detailed examples for OpenAI and Anthropic adapters, with shorter references to other providers (Deepseek, Gemini, and Groq). It also covers best practices for implementing new provider adapters and extending the system to support custom providers.

## Adapter Interface & Requirements

### Provider Adapter Interface

All provider adapters must implement the `ProviderAdapter` interface, which defines the contract between the MCP server and the underlying LLM providers.

```typescript
/**
 * Interface defining the contract for provider adapters
 */
export interface ProviderAdapter {
  /**
   * Unique identifier for this provider
   */
  readonly id: string;

  /**
   * List of models supported by this provider
   */
  readonly models: string[];

  /**
   * Generate a completion using this provider
   * @param request Standardized LLM request
   * @returns Standardized LLM response
   */
  generate(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Generate a streaming completion using this provider
   * @param request Standardized LLM request
   * @returns Async iterable of streaming responses
   */
  streamGenerate(request: LLMRequest): AsyncIterableIterator<StreamingResponse>;

  /**
   * Get capabilities for a specific model from this provider
   * @param model Model identifier
   * @returns Capabilities metadata
   */
  getCapabilities(model: string): ProviderCapabilities;

  /**
   * Check if the provider can handle a specific request
   * @param request Request to validate
   * @returns Validation result with reason if invalid
   */
  validateRequest(request: LLMRequest): Promise<{ valid: boolean, reason?: string }>;

  /**
   * Check the health/availability of the provider
   * @returns Boolean indicating if provider is healthy
   */
  checkHealth(): Promise<boolean>;

  /**
   * Get usage statistics for this provider
   * @returns Provider usage statistics
   */
  getStats(): ProviderStats;
}
```

### Provider Capabilities

Each adapter must report its capabilities through a standardized structure:

```typescript
/**
 * Defines the capabilities of a provider or model
 */
export interface ProviderCapabilities {
  /**
   * Whether the model supports function/tool calling
   */
  supportsFunctionCalling: boolean;

  /**
   * Whether the model supports streaming responses
   */
  supportsStreaming: boolean;

  /**
   * Whether the model supports vision/image inputs
   */
  supportsVision: boolean;

  /**
   * Whether the model supports JSON mode
   */
  supportsJsonMode: boolean;

  /**
   * Maximum context length in tokens
   */
  maxContextLength: number;

  /**
   * Whether token counting is available through the provider
   */
  tokenCountingAvailable: boolean;

  /**
   * Additional provider-specific capabilities
   */
  additionalCapabilities?: Record<string, any>;
}
```

### Base Provider Adapter

A base implementation provides common functionality for all provider adapters:

```typescript
/**
 * Base class for provider adapters with shared functionality
 */
export abstract class BaseProviderAdapter implements ProviderAdapter {
  public readonly id: string;
  public readonly models: string[];
  protected apiKey: string;
  protected baseUrl: string;
  protected httpClient: HttpClient;
  private stats: ProviderStats = {
    requestCount: 0,
    errorCount: 0,
    avgLatency: 0
  };

  constructor(id: string, models: string[], apiKey: string, baseUrl: string) {
    this.id = id;
    this.models = models;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.httpClient = createHttpClient();
  }

  abstract generate(request: LLMRequest): Promise<LLMResponse>;
  abstract streamGenerate(request: LLMRequest): AsyncIterableIterator<StreamingResponse>;
  abstract getCapabilities(model: string): ProviderCapabilities;

  async validateRequest(request: LLMRequest): Promise<{ valid: boolean, reason?: string }> {
    // Common validation logic
    // Check if the requested model is supported
    if (!this.models.includes(request.model)) {
      return {
        valid: false,
        reason: `Model ${request.model} is not supported by provider ${this.id}`
      };
    }

    // Check streaming capability
    if (request.stream) {
      const capabilities = this.getCapabilities(request.model);
      if (!capabilities.supportsStreaming) {
        return {
          valid: false,
          reason: `Streaming is not supported by model ${request.model} on provider ${this.id}`
        };
      }
    }

    // Check tool usage capability
    if (request.tools && request.tools.length > 0) {
      const capabilities = this.getCapabilities(request.model);
      if (!capabilities.supportsFunctionCalling) {
        return {
          valid: false,
          reason: `Tool calling is not supported by model ${request.model} on provider ${this.id}`
        };
      }
    }

    return { valid: true };
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Basic health check implementation
      // This should be overridden with provider-specific logic
      return true;
    } catch (error) {
      logger.error(`Health check failed for provider ${this.id}`, { error });
      return false;
    }
  }

  getStats(): ProviderStats {
    return { ...this.stats };
  }

  protected updateStats(startTime: number, error: boolean = false): void {
    const latency = Date.now() - startTime;
    this.stats.requestCount++;
    if (error) {
      this.stats.errorCount++;
    }

    // Update average latency
    this.stats.avgLatency =
      (this.stats.avgLatency * (this.stats.requestCount - 1) + latency) /
      this.stats.requestCount;

    // Record metrics
    recordProviderMetrics(this.id, latency, error);
  }

  protected createRequestHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  protected handleError(error: any): MCPError {
    // Normalize provider errors to MCP errors
    if (error.response) {
      // API error with response
      const status = error.response.status;
      const data = error.response.data;

      // Map common HTTP errors to MCP error types
      if (status === 401 || status === 403) {
        return new MCPError(
          'authentication_error',
          `${this.id} authentication error: ${data.error?.message || 'Invalid API key'}`,
          401
        );
      }

      if (status === 429) {
        return new MCPError(
          'rate_limit_exceeded',
          `${this.id} rate limit exceeded: ${data.error?.message || 'Too many requests'}`,
          429
        );
      }

      if (status === 400) {
        return new MCPError(
          'invalid_request',
          `${this.id} request error: ${data.error?.message || 'Invalid request'}`,
          400
        );
      }

      return new MCPError(
        'provider_error',
        `${this.id} API error (${status}): ${data.error?.message || 'Unknown error'}`,
        500
      );
    }

    // Network or other errors
    return new MCPError(
      'provider_error',
      `${this.id} error: ${error.message || 'Unknown error'}`,
      500
    );
  }
}
```

## OpenAI Adapter Implementation

The OpenAI adapter translates between the MCP protocol and the OpenAI API. Here's a full implementation example:

```typescript
import { ChatCompletionCreateParams, OpenAI } from 'openai';
import {
  BaseProviderAdapter,
  LLMRequest,
  LLMResponse,
  StreamingResponse,
  ProviderCapabilities,
  MCPError
} from '../types';
import { logger } from '../utils/logger';

export class OpenAIAdapter extends BaseProviderAdapter {
  private client: OpenAI;
  private modelCapabilities: Map<string, ProviderCapabilities>;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    // Define supported models
    const models = [
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4-32k',
      'gpt-4-vision-preview'
    ];

    super('openai', models, apiKey, baseUrl);

    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl
    });

    // Define model capabilities
    this.modelCapabilities = new Map();
    this.initializeModelCapabilities();
  }

  private initializeModelCapabilities(): void {
    // GPT-3.5 Turbo
    this.modelCapabilities.set('gpt-3.5-turbo', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: false,
      supportsJsonMode: true,
      maxContextLength: 16385,
      tokenCountingAvailable: true
    });

    // GPT-3.5 Turbo 16k
    this.modelCapabilities.set('gpt-3.5-turbo-16k', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: false,
      supportsJsonMode: true,
      maxContextLength: 16385,
      tokenCountingAvailable: true
    });

    // GPT-4
    this.modelCapabilities.set('gpt-4', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: false,
      supportsJsonMode: true,
      maxContextLength: 8192,
      tokenCountingAvailable: true
    });

    // GPT-4 Turbo
    this.modelCapabilities.set('gpt-4-turbo', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: true,
      supportsJsonMode: true,
      maxContextLength: 128000,
      tokenCountingAvailable: true
    });

    // GPT-4 32k
    this.modelCapabilities.set('gpt-4-32k', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: false,
      supportsJsonMode: true,
      maxContextLength: 32768,
      tokenCountingAvailable: true
    });

    // GPT-4 Vision
    this.modelCapabilities.set('gpt-4-vision-preview', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: true,
      supportsJsonMode: true,
      maxContextLength: 128000,
      tokenCountingAvailable: true
    });
  }

  /**
   * Get capabilities for a specific OpenAI model
   */
  getCapabilities(model: string): ProviderCapabilities {
    const capabilities = this.modelCapabilities.get(model);

    if (!capabilities) {
      // Return default capabilities for unknown models
      return {
        supportsFunctionCalling: false,
        supportsStreaming: true,
        supportsVision: false,
        supportsJsonMode: false,
        maxContextLength: 4096,
        tokenCountingAvailable: true
      };
    }

    return { ...capabilities };
  }

  /**
   * Generate a completion using OpenAI
   */
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Map the MCP request to OpenAI format
      const openaiRequest = this.mapRequest(request);

      // Call the OpenAI API
      logger.debug('Sending request to OpenAI', { model: request.model });
      const response = await this.client.chat.completions.create(openaiRequest);

      // Map the OpenAI response to MCP format
      const mcpResponse = this.mapResponse(response);

      // Update stats
      this.updateStats(startTime);

      return mcpResponse;
    } catch (error) {
      // Update error stats
      this.updateStats(startTime, true);

      // Log and rethrow as MCP error
      logger.error('Error calling OpenAI API', { error, model: request.model });
      throw this.handleError(error);
    }
  }

  /**
   * Generate a streaming completion using OpenAI
   */
  async *streamGenerate(request: LLMRequest): AsyncIterableIterator<StreamingResponse> {
    const startTime = Date.now();

    try {
      // Ensure stream flag is set
      request.stream = true;

      // Map the MCP request to OpenAI format
      const openaiRequest = this.mapRequest(request);

      // Call the OpenAI API with streaming enabled
      logger.debug('Sending streaming request to OpenAI', { model: request.model });
      const stream = await this.client.chat.completions.create({
        ...openaiRequest,
        stream: true
      });

      // Process the stream
      for await (const chunk of stream) {
        // Map each chunk to MCP format
        const streamingResponse = this.mapStreamingChunk(chunk);
        yield streamingResponse;
      }

      // Update stats after streaming completes
      this.updateStats(startTime);
    } catch (error) {
      // Update error stats
      this.updateStats(startTime, true);

      // Log error
      logger.error('Error in OpenAI streaming', { error, model: request.model });

      // Yield error as a special chunk
      yield {
        error: {
          code: 'streaming_error',
          message: error.message || 'Error in OpenAI streaming'
        }
      };
    }
  }

  /**
   * Map MCP request format to OpenAI request format
   */
  private mapRequest(request: LLMRequest): ChatCompletionCreateParams {
    const openaiRequest: ChatCompletionCreateParams = {
      model: request.model,
      messages: [...request.messages],
      stream: Boolean(request.stream),
    };

    // Add optional parameters if present
    if (request.temperature !== undefined) {
      openaiRequest.temperature = request.temperature;
    }

    if (request.max_tokens !== undefined) {
      openaiRequest.max_tokens = request.max_tokens;
    }

    if (request.top_p !== undefined) {
      openaiRequest.top_p = request.top_p;
    }

    if (request.frequency_penalty !== undefined) {
      openaiRequest.frequency_penalty = request.frequency_penalty;
    }

    if (request.presence_penalty !== undefined) {
      openaiRequest.presence_penalty = request.presence_penalty;
    }

    // Handle response format (JSON mode)
    if (request.response_format?.type === 'json_object') {
      openaiRequest.response_format = { type: 'json_object' };
    }

    // Handle tools/functions
    if (request.tools && request.tools.length > 0) {
      openaiRequest.tools = this.mapTools(request.tools);

      if (request.tool_choice) {
        openaiRequest.tool_choice = request.tool_choice;
      }
    }

    return openaiRequest;
  }

  /**
   * Map MCP tools format to OpenAI tools format
   */
  private mapTools(tools: any[]): any[] {
    return tools.map(tool => {
      // OpenAI uses the same format as our standardized format
      return { ...tool };
    });
  }

  /**
   * Map OpenAI response to MCP response format
   */
  private mapResponse(response: any): LLMResponse {
    return {
      id: response.id,
      object: 'completion',
      created: response.created,
      model: response.model,
      provider: this.id,
      choices: response.choices.map(choice => ({
        index: choice.index,
        message: {
          role: choice.message.role,
          content: choice.message.content,
          tool_calls: choice.message.tool_calls
        },
        finish_reason: choice.finish_reason
      })),
      usage: response.usage && {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      },
      metadata: {
        latency_ms: Date.now() - response.created * 1000,
        provider_specific: {}
      }
    };
  }

  /**
   * Map OpenAI streaming chunk to MCP streaming response
   */
  private mapStreamingChunk(chunk: any): StreamingResponse {
    if (chunk.choices && chunk.choices.length > 0) {
      return {
        id: chunk.id,
        object: 'completion.chunk',
        created: chunk.created,
        model: chunk.model,
        provider: this.id,
        choices: chunk.choices.map(choice => ({
          index: choice.index,
          delta: choice.delta,
          finish_reason: choice.finish_reason
        }))
      };
    }

    // Handle special case for final chunk
    return {
      id: chunk.id,
      object: 'completion.chunk',
      created: chunk.created,
      model: chunk.model,
      provider: this.id,
      choices: []
    };
  }

  /**
   * Perform a health check by calling a lightweight API endpoint
   */
  async checkHealth(): Promise<boolean> {
    try {
      // List models as a lightweight health check
      await this.client.models.list();
      return true;
    } catch (error) {
      logger.error('OpenAI health check failed', { error });
      return false;
    }
  }
}
```

## Anthropic Adapter Implementation

The Anthropic adapter translates between the MCP protocol and Anthropic's Claude API:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import {
  BaseProviderAdapter,
  LLMRequest,
  LLMResponse,
  StreamingResponse,
  ProviderCapabilities,
  MCPError
} from '../types';
import { logger } from '../utils/logger';

export class AnthropicAdapter extends BaseProviderAdapter {
  private client: Anthropic;
  private modelCapabilities: Map<string, ProviderCapabilities>;

  constructor(apiKey: string, baseUrl: string = 'https://api.anthropic.com') {
    // Define supported models
    const models = [
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-3-haiku',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2'
    ];

    super('anthropic', models, apiKey, baseUrl);

    // Initialize Anthropic client
    this.client = new Anthropic({
      apiKey: this.apiKey,
      baseURL: this.baseUrl
    });

    // Define model capabilities
    this.modelCapabilities = new Map();
    this.initializeModelCapabilities();
  }

  private initializeModelCapabilities(): void {
    // Claude 3 Opus
    this.modelCapabilities.set('claude-3-opus', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: true,
      supportsJsonMode: true,
      maxContextLength: 200000,
      tokenCountingAvailable: true
    });

    // Claude 3 Sonnet
    this.modelCapabilities.set('claude-3-sonnet', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: true,
      supportsJsonMode: true,
      maxContextLength: 200000,
      tokenCountingAvailable: true
    });

    // Claude 3 Haiku
    this.modelCapabilities.set('claude-3-haiku', {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: true,
      supportsJsonMode: true,
      maxContextLength: 200000,
      tokenCountingAvailable: true
    });

    // Claude 2.1
    this.modelCapabilities.set('claude-2.1', {
      supportsFunctionCalling: false,
      supportsStreaming: true,
      supportsVision: false,
      supportsJsonMode: false,
      maxContextLength: 100000,
      tokenCountingAvailable: true
    });

    // Claude 2.0
    this.modelCapabilities.set('claude-2.0', {
      supportsFunctionCalling: false,
      supportsStreaming: true,
      supportsVision: false,
      supportsJsonMode: false,
      maxContextLength: 100000,
      tokenCountingAvailable: true
    });

    // Claude Instant 1.2
    this.modelCapabilities.set('claude-instant-1.2', {
      supportsFunctionCalling: false,
      supportsStreaming: true,
      supportsVision: false,
      supportsJsonMode: false,
      maxContextLength: 100000,
      tokenCountingAvailable: true
    });
  }

  /**
   * Get capabilities for a specific Anthropic model
   */
  getCapabilities(model: string): ProviderCapabilities {
    const capabilities = this.modelCapabilities.get(model);

    if (!capabilities) {
      // Return default capabilities for unknown models
      return {
        supportsFunctionCalling: false,
        supportsStreaming: true,
        supportsVision: false,
        supportsJsonMode: false,
        maxContextLength: 100000,
        tokenCountingAvailable: true
      };
    }

    return { ...capabilities };
  }

  /**
   * Generate a completion using Anthropic
   */
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Map the MCP request to Anthropic format
      const anthropicRequest = this.mapRequest(request);

      // Call the Anthropic API
      logger.debug('Sending request to Anthropic', { model: request.model });
      const response = await this.client.messages.create(anthropicRequest);

      // Map the Anthropic response to MCP format
      const mcpResponse = this.mapResponse(response);

      // Update stats
      this.updateStats(startTime);

      return mcpResponse;
    } catch (error) {
      // Update error stats
      this.updateStats(startTime, true);

      // Log and rethrow as MCP error
      logger.error('Error calling Anthropic API', { error, model: request.model });
      throw this.handleError(error);
    }
  }

  /**
   * Generate a streaming completion using Anthropic
   */
  async *streamGenerate(request: LLMRequest): AsyncIterableIterator<StreamingResponse> {
    const startTime = Date.now();

    try {
      // Ensure stream flag is set
      request.stream = true;

      // Map the MCP request to Anthropic format
      const anthropicRequest = this.mapRequest(request);

      // Call the Anthropic API with streaming enabled
      logger.debug('Sending streaming request to Anthropic', { model: request.model });
      const stream = await this.client.messages.create({
        ...anthropicRequest,
        stream: true
      });

      // Process the stream
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' || chunk.type === 'message_delta') {
          // Map each chunk to MCP format
          const streamingResponse = this.mapStreamingChunk(chunk);
          yield streamingResponse;
        } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
          // Handle tool use
          const toolResponse = this.mapToolUseChunk(chunk);
          yield toolResponse;
        }
      }

      // Update stats after streaming completes
      this.updateStats(startTime);
    } catch (error) {
      // Update error stats
      this.updateStats(startTime, true);

      // Log error
      logger.error('Error in Anthropic streaming', { error, model: request.model });

      // Yield error as a special chunk
      yield {
        error: {
          code: 'streaming_error',
          message: error.message || 'Error in Anthropic streaming'
        }
      };
    }
  }

  /**
   * Map MCP request format to Anthropic request format
   */
  private mapRequest(request: LLMRequest): any {
    // Convert MCP messages to Anthropic format
    const messages = this.convertMessages(request.messages);

    const anthropicRequest: any = {
      model: request.model,
      messages: messages,
      stream: Boolean(request.stream),
    };

    // Add optional parameters if present
    if (request.temperature !== undefined) {
      anthropicRequest.temperature = request.temperature;
    }

    if (request.max_tokens !== undefined) {
      anthropicRequest.max_tokens = request.max_tokens;
    }

    if (request.top_p !== undefined) {
      anthropicRequest.top_p = request.top_p;
    }

    // Handle JSON mode
    if (request.response_format?.type === 'json_object') {
      anthropicRequest.system = (anthropicRequest.system || '') +
        ' Respond using valid JSON format.';
    }

    // Handle tools/functions for Claude 3 models
    if (request.tools && request.tools.length > 0 &&
        this.getCapabilities(request.model).supportsFunctionCalling) {
      anthropicRequest.tools = this.mapTools(request.tools);
    }

    return anthropicRequest;
  }

  /**
   * Convert MCP messages to Anthropic format
   */
  private convertMessages(messages: any[]): any[] {
    const result = [];

    // Extract system message
    const systemMessages = messages.filter(m => m.role === 'system');
    let systemContent = '';
    if (systemMessages.length > 0) {
      systemContent = systemMessages.map(m => m.content).join('\n\n');
    }

    // Process other messages
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    for (let i = 0; i < nonSystemMessages.length; i++) {
      const message = nonSystemMessages[i];

      // Convert role
      let role = message.role;
      if (role === 'assistant') {
        role = 'assistant';
      } else {
        role = 'user';
      }

      // Add to result
      result.push({
        role,
        content: message.content
      });
    }

    // Add system instruction if present
    if (systemContent) {
      result[0] = {
        ...result[0],
        system: systemContent
      };
    }

    return result;
  }

  /**
   * Map MCP tools format to Anthropic tools format
   */
  private mapTools(tools: any[]): any[] {
    return tools.map(tool => {
      if (tool.type === 'function') {
        return {
          type: 'function',
          function: {
            name: tool.function.name,
            description: tool.function.description,
            parameters: tool.function.parameters
          }
        };
      }
      return tool;
    });
  }

  /**
   * Map Anthropic response to MCP response format
   */
  private mapResponse(response: any): LLMResponse {
    // Extract content from Anthropic response
    let content = '';
    let toolCalls = [];

    if (response.content && Array.isArray(response.content)) {
      for (const block of response.content) {
        if (block.type === 'text') {
          content += block.text;
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: `call_${Date.now()}_${toolCalls.length}`,
            type: 'function',
            function: {
              name: block.name,
              arguments: block.input
            }
          });
        }
      }
    }

    // Create MCP response
    return {
      id: response.id,
      object: 'completion',
      created: Date.now() / 1000,
      model: response.model,
      provider: this.id,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: content,
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined
        },
        finish_reason: response.stop_reason || 'stop'
      }],
      usage: response.usage && {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      },
      metadata: {
        latency_ms: Date.now() - (response.created * 1000),
        provider_specific: {
          stop_reason: response.stop_reason,
          stop_sequence: response.stop_sequence
        }
      }
    };
  }

  /**
   * Map Anthropic streaming chunk to MCP streaming response
   */
  private mapStreamingChunk(chunk: any): StreamingResponse {
    // For content_block_delta
    if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
      return {
        id: chunk.message_id,
        object: 'completion.chunk',
        created: Date.now() / 1000,
        model: chunk.model || '',
        provider: this.id,
        choices: [{
          index: 0,
          delta: {
            content: chunk.delta.text
          },
          finish_reason: null
        }]
      };
    }

    // For message_delta with stop_reason (final chunk)
    if (chunk.type === 'message_delta' && chunk.delta?.stop_reason) {
      return {
        id: chunk.message_id,
        object: 'completion.chunk',
        created: Date.now() / 1000,
        model: chunk.model || '',
        provider: this.id,
        choices: [{
          index: 0,
          delta: {},
          finish_reason: chunk.delta.stop_reason
        }]
      };
    }

    // Default empty chunk
    return {
      id: chunk.message_id || `chunk_${Date.now()}`,
      object: 'completion.chunk',
      created: Date.now() / 1000,
      model: chunk.model || '',
      provider: this.id,
      choices: [{
        index: 0,
        delta: {},
        finish_reason: null
      }]
    };
  }

  /**
   * Map Anthropic tool use chunk to MCP streaming response
   */
  private mapToolUseChunk(chunk: any): StreamingResponse {
    const toolBlock = chunk.content_block;

    return {
      id: chunk.message_id,
      object: 'completion.chunk',
      created: Date.now() / 1000,
      model: chunk.model || '',
      provider: this.id,
      choices: [{
        index: 0,
        delta: {
          tool_calls: [{
            id: `call_${Date.now()}`,
            type: 'function',
            function: {
              name: toolBlock.name,
              arguments: toolBlock.input
            }
          }]
        },
        finish_reason: null
      }]
    };
  }

  /**
   * Perform a health check by calling a lightweight API endpoint
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Call a lightweight endpoint to check health
      await this.client.getModels();
      return true;
    } catch (error) {
      logger.error('Anthropic health check failed', { error });
      return false;
    }
  }
}
```

## Other Provider Adapter Implementations

### Deepseek Adapter (Summary)

Key implementation points:

1. **API Compatibility**: Deepseek uses an OpenAI-compatible API, which simplifies implementation
2. **Model Capabilities**: Focus on mapping Deepseek's specific model capabilities
3. **Streaming Implementation**: Similar to OpenAI but with Deepseek-specific error handling
4. **Tool Support**: Limited to specific models

Example of model capabilities initialization:

```typescript
private initializeModelCapabilities(): void {
  // Deepseek-Chat
  this.modelCapabilities.set('deepseek-chat', {
    supportsFunctionCalling: true,
    supportsStreaming: true,
    supportsVision: false,
    supportsJsonMode: false,
    maxContextLength: 32768,
    tokenCountingAvailable: true
  });

  // Deepseek-Coder
  this.modelCapabilities.set('deepseek-coder', {
    supportsFunctionCalling: true,
    supportsStreaming: true,
    supportsVision: false,
    supportsJsonMode: false,
    maxContextLength: 32768,
    tokenCountingAvailable: true
  });
}
```

### Gemini Adapter (Summary)

Key implementation points:

1. **API Differences**: Gemini's API differs significantly from others, requiring custom mapping
2. **Content Handling**: Special handling for different content types
3. **Function Calling**: Implementation of function calling format conversion
4. **Error Handling**: Gemini-specific error codes and messages

Example of request mapping:

```typescript
private mapRequest(request: LLMRequest): any {
  // Initialize Gemini request
  const geminiRequest: any = {
    model: this.mapModelName(request.model),
    contents: this.convertMessages(request.messages),
    generationConfig: {}
  };

  // Add generation config parameters if present
  if (request.temperature !== undefined) {
    geminiRequest.generationConfig.temperature = request.temperature;
  }

  if (request.max_tokens !== undefined) {
    geminiRequest.generationConfig.maxOutputTokens = request.max_tokens;
  }

  if (request.top_p !== undefined) {
    geminiRequest.generationConfig.topP = request.top_p;
  }

  // Handle tools/functions
  if (request.tools && request.tools.length > 0) {
    geminiRequest.tools = this.mapTools(request.tools);
  }

  return geminiRequest;
}
```

### Groq Adapter (Summary)

Key implementation points:

1. **API Compatibility**: Groq also uses an OpenAI-compatible API
2. **Performance Optimization**: Groq-specific optimizations for low latency
3. **Model Selection**: Emphasis on high-throughput models
4. **Authentication Handling**: Groq-specific API key handling

Example of capabilities initialization:

```typescript
private initializeModelCapabilities(): void {
  // LLaMA 70B
  this.modelCapabilities.set('llama2-70b-4096', {
    supportsFunctionCalling: false,
    supportsStreaming: true,
    supportsVision: false,
    supportsJsonMode: false,
    maxContextLength: 4096,
    tokenCountingAvailable: true
  });

  // Mixtral 8x7B
  this.modelCapabilities.set('mixtral-8x7b-32768', {
    supportsFunctionCalling: true,
    supportsStreaming: true,
    supportsVision: false,
    supportsJsonMode: true,
    maxContextLength: 32768,
    tokenCountingAvailable: true
  });
}
```

## Error Handling & Credential Management

### Error Handling Strategy

Effective error handling for provider adapters follows these principles:

1. **Error Normalization**: Convert provider-specific errors to standardized MCP errors
2. **Graceful Degradation**: Fall back to alternative providers when possible
3. **Detailed Logging**: Log detailed error information for debugging
4. **User-Friendly Messages**: Return actionable error messages to clients

Implementation approach for error handling:

```typescript
/**
 * Normalize provider-specific errors to MCP format
 */
protected handleProviderErrors(error: any): MCPError {
  // Check for provider-specific error patterns

  // Rate limiting errors
  if (this.isRateLimitError(error)) {
    return new MCPError(
      'rate_limit_exceeded',
      `Provider ${this.id} rate limit exceeded. Try again later.`,
      429
    );
  }

  // Authentication errors
  if (this.isAuthError(error)) {
    return new MCPError(
      'authentication_error',
      `Invalid API key for provider ${this.id}.`,
      401
    );
  }

  // Context length errors
  if (this.isContextLengthError(error)) {
    return new MCPError(
      'context_length_exceeded',
      `Input is too long for model ${error.model || 'unknown'}.`,
      400
    );
  }

  // Content policy violations
  if (this.isContentPolicyError(error)) {
    return new MCPError(
      'content_policy_violation',
      `Content violates provider ${this.id}'s content policy.`,
      400
    );
  }

  // Default error
  return new MCPError(
    'provider_error',
    `Provider ${this.id} error: ${error.message || 'Unknown error'}`,
    500
  );
}

/**
 * Check if error is a rate limit error
 */
private isRateLimitError(error: any): boolean {
  // Provider-specific implementation
  if (error.status === 429) return true;
  if (error.error?.type === 'rate_limit_exceeded') return true;
  if (error.message?.includes('rate limit')) return true;
  return false;
}

// Similar methods for other error types
```

### Credential Management

Secure credential management is essential for provider adapters:

1. **Storage Security**: Store API keys in secure storage (not in code or config files)
2. **Key Rotation**: Support automatic key rotation
3. **Scoped Credentials**: Use credentials with minimum necessary permissions
4. **Monitoring**: Track API key usage and alert on unusual patterns

Implementation approach for credential management:

```typescript
/**
 * Credential manager for provider adapters
 */
export class ProviderCredentialManager {
  private credentialStore: CredentialStore;
  private cache: Map<string, CachedCredential> = new Map();

  constructor(credentialStore: CredentialStore) {
    this.credentialStore = credentialStore;
  }

  /**
   * Get a credential for a provider
   */
  async getCredential(provider: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(provider);
    if (cached && !this.isExpired(cached)) {
      return cached.value;
    }

    // Retrieve from secure store
    const credential = await this.credentialStore.getCredential(provider);

    // Cache with expiration
    this.cache.set(provider, {
      value: credential,
      expiry: Date.now() + (15 * 60 * 1000) // 15 minutes
    });

    return credential;
  }

  /**
   * Rotate credentials for a provider
   */
  async rotateCredential(provider: string): Promise<void> {
    // Clear from cache
    this.cache.delete(provider);

    // Trigger rotation in credential store
    await this.credentialStore.rotateCredential(provider);
  }

  /**
   * Check if a cached credential is expired
   */
  private isExpired(cached: CachedCredential): boolean {
    return Date.now() > cached.expiry;
  }
}

interface CachedCredential {
  value: string;
  expiry: number;
}
```

## Response Normalization

A critical responsibility of provider adapters is to normalize responses from different providers into a consistent MCP format:

### Response Format Standardization

```typescript
/**
 * Normalize provider-specific responses to MCP format
 */
protected normalizeResponse(providerResponse: any): LLMResponse {
  return {
    // Standard fields that all responses include
    id: this.generateResponseId(),
    object: 'completion',
    created: Math.floor(Date.now() / 1000),
    model: providerResponse.model || this.lastRequestedModel,
    provider: this.id,

    // Normalize choices - this varies most by provider
    choices: this.normalizeChoices(providerResponse),

    // Normalize usage statistics
    usage: this.normalizeUsage(providerResponse),

    // Include provider-specific metadata
    metadata: {
      latency_ms: this.calculateLatency(providerResponse),
      provider_specific: this.extractProviderMetadata(providerResponse)
    }
  };
}

/**
 * Normalize response choices
 */
private normalizeChoices(response: any): any[] {
  // Provider-specific implementation
  // Example for a generic provider
  const result = [];

  // Handle array of completions
  if (response.choices && Array.isArray(response.choices)) {
    return response.choices.map((choice, index) => ({
      index,
      message: this.normalizeMessage(choice),
      finish_reason: this.normalizeFinishReason(choice)
    }));
  }

  // Handle single completion
  return [{
    index: 0,
    message: this.normalizeMessage(response),
    finish_reason: this.normalizeFinishReason(response)
  }];
}

/**
 * Normalize message content
 */
private normalizeMessage(choice: any): any {
  // Handle different message formats
  if (choice.message) {
    return {
      role: choice.message.role || 'assistant',
      content: choice.message.content || '',
      tool_calls: this.normalizeToolCalls(choice.message)
    };
  }

  // Handle direct content
  return {
    role: 'assistant',
    content: choice.text || choice.content || '',
    tool_calls: this.normalizeToolCalls(choice)
  };
}

/**
 * Normalize tool calls from different formats
 */
private normalizeToolCalls(message: any): any[] | undefined {
  // OpenAI format
  if (message.tool_calls && Array.isArray(message.tool_calls)) {
    return message.tool_calls;
  }

  // Anthropic format
  if (message.tool_uses && Array.isArray(message.tool_uses)) {
    return message.tool_uses.map(tool => ({
      id: tool.id || `call_${Date.now()}`,
      type: 'function',
      function: {
        name: tool.name,
        arguments: tool.input
      }
    }));
  }

  // Gemini format
  if (message.functionCall) {
    return [{
      id: `call_${Date.now()}`,
      type: 'function',
      function: {
        name: message.functionCall.name,
        arguments: message.functionCall.args
      }
    }];
  }

  return undefined;
}
```

## Handling Provider-Specific Features

One of the key challenges in provider adapter implementation is dealing with features that aren't universally supported:

### 1. Capability Feature Detection

```typescript
/**
 * Check if a provider supports a specific capability
 */
export function checkCapabilitySupport(request: LLMRequest, provider: ProviderAdapter): {
  supported: boolean;
  missingFeatures: string[];
} {
  const model = request.model;
  const capabilities = provider.getCapabilities(model);
  const missingFeatures = [];

  // Check streaming support
  if (request.stream && !capabilities.supportsStreaming) {
    missingFeatures.push('streaming');
  }

  // Check tool support
  if (request.tools?.length > 0 && !capabilities.supportsFunctionCalling) {
    missingFeatures.push('function_calling');
  }

  // Check JSON mode support
  if (request.response_format?.type === 'json_object' && !capabilities.supportsJsonMode) {
    missingFeatures.push('json_mode');
  }

  // Check vision support
  if (hasImageContent(request.messages) && !capabilities.supportsVision) {
    missingFeatures.push('vision');
  }

  // Check context length
  if (estimateTokenCount(request) > capabilities.maxContextLength) {
    missingFeatures.push('context_length');
  }

  return {
    supported: missingFeatures.length === 0,
    missingFeatures
  };
}
```

### 2. Feature Emulation Layer

For some features that aren't natively supported by a provider, it's possible to implement emulation:

```typescript
/**
 * Feature emulation for provider adapters
 */
export class FeatureEmulationLayer {
  /**
   * Emulate JSON mode for providers that don't support it natively
   */
  static emulateJsonMode(request: LLMRequest): LLMRequest {
    // Add to system message
    const systemMessage = {
      role: 'system',
      content: 'You must respond with valid JSON only, without any explanations or markdown formatting.'
    };

    // Clone the request
    const modifiedRequest = { ...request };

    // Add or update system message
    if (!modifiedRequest.messages) {
      modifiedRequest.messages = [systemMessage];
    } else {
      const hasSystem = modifiedRequest.messages.some(m => m.role === 'system');
      if (hasSystem) {
        modifiedRequest.messages = modifiedRequest.messages.map(m => {
          if (m.role === 'system') {
            return {
              role: 'system',
              content: `${m.content}\n\nYou must respond with valid JSON only, without any explanations or markdown formatting.`
            };
          }
          return m;
        });
      } else {
        modifiedRequest.messages = [systemMessage, ...modifiedRequest.messages];
      }
    }

    return modifiedRequest;
  }

  /**
   * Emulate function calling for providers that don't support it natively
   */
  static emulateFunctionCalling(request: LLMRequest): LLMRequest {
    if (!request.tools || request.tools.length === 0) {
      return request;
    }

    // Generate function descriptions
    const functionDescriptions = request.tools
      .filter(tool => tool.type === 'function')
      .map(tool => {
        const func = tool.function;
        return `
Function Name: ${func.name}
Description: ${func.description || 'No description provided'}
Parameters: ${JSON.stringify(func.parameters, null, 2)}
        `.trim();
      })
      .join('\n\n');

    // Create instruction
    const instruction = `
You have access to the following functions. To use a function, respond in the following format:

<function_call>
{
  "name": "function_name",
  "arguments": {
    "arg1": "value1",
    "arg2": "value2"
  }
}
</function_call>

Available functions:

${functionDescriptions}
    `.trim();

    // Modify the request
    const modifiedRequest = { ...request };

    // Add to system message or create one
    if (!modifiedRequest.messages) {
      modifiedRequest.messages = [{ role: 'system', content: instruction }];
    } else {
      const hasSystem = modifiedRequest.messages.some(m => m.role === 'system');
      if (hasSystem) {
        modifiedRequest.messages = modifiedRequest.messages.map(m => {
          if (m.role === 'system') {
            return {
              role: 'system',
              content: `${m.content}\n\n${instruction}`
            };
          }
          return m;
        });
      } else {
        modifiedRequest.messages = [
          { role: 'system', content: instruction },
          ...modifiedRequest.messages
        ];
      }
    }

    // Remove tools from request since we're emulating
    delete modifiedRequest.tools;

    return modifiedRequest;
  }

  /**
   * Post-process response to extract emulated function calls
   */
  static extractEmulatedFunctionCalls(response: LLMResponse): LLMResponse {
    // Check each choice
    const modifiedResponse = { ...response };

    modifiedResponse.choices = response.choices.map(choice => {
      const content = choice.message.content || '';

      // Try to extract function call pattern
      const functionCallRegex = /<function_call>([\s\S]*?)<\/function_call>/;
      const match = content.match(functionCallRegex);

      if (match) {
        try {
          // Parse the function call
          const functionCall = JSON.parse(match[1].trim());

          // Create tool call
          const toolCall = {
            id: `call_${Date.now()}`,
            type: 'function',
            function: {
              name: functionCall.name,
              arguments: JSON.stringify(functionCall.arguments)
            }
          };

          // Remove function call from content
          const cleanedContent = content.replace(functionCallRegex, '').trim();

          // Return modified choice
          return {
            ...choice,
            message: {
              ...choice.message,
              content: cleanedContent,
              tool_calls: [toolCall]
            }
          };
        } catch (error) {
          // Failed to parse function call, return original
          return choice;
        }
      }

      // No function call found, return original
      return choice;
    });

    return modifiedResponse;
  }
}
```

### 3. Dynamic Routing Based on Capabilities

```typescript
/**
 * Select best provider based on request features
 */
export async function selectBestProvider(
  request: LLMRequest,
  providers: ProviderAdapter[]
): Promise<ProviderAdapter> {
  // If specific provider requested, try to use it
  if (request.provider) {
    const requestedProvider = providers.find(p => p.id === request.provider);
    if (requestedProvider) {
      const validation = await requestedProvider.validateRequest(request);
      if (validation.valid) {
        return requestedProvider;
      }
    }
  }

  // Evaluate each provider for capability support
  const providerScores = await Promise.all(
    providers.map(async provider => {
      try {
        const validation = await provider.validateRequest(request);
        if (!validation.valid) {
          return { provider, score: -1 }; // Not suitable
        }

        // Check capabilities
        const { supported, missingFeatures } = checkCapabilitySupport(request, provider);
        if (!supported) {
          return { provider, score: 0 }; // Could work with emulation
        }

        // Calculate score based on various factors
        let score = 100; // Base score for full support

        // Check health and adjust score
        const isHealthy = await provider.checkHealth();
        if (!isHealthy) {
          score -= 30;
        }

        // Check stats and adjust score
        const stats = provider.getStats();
        if (stats.errorCount > stats.requestCount * 0.05) {
          score -= 20; // Penalize for high error rate
        }

        return { provider, score };
      } catch (error) {
        return { provider, score: -1 }; // Error during evaluation
      }
    })
  );

  // Sort by score and return best provider
  const validProviders = providerScores
    .filter(p => p.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (validProviders.length === 0) {
    throw new Error('No suitable provider found for request');
  }

  return validProviders[0].provider;
}
```

## Extending for Custom Providers

To support custom or internal LLM providers, the system includes extension points:

```typescript
/**
 * Register a custom provider adapter
 */
export function registerCustomProvider(
  providerRegistry: ProviderRegistry,
  adapter: ProviderAdapter
): void {
  // Validate adapter
  if (!adapter.id || !adapter.models || !adapter.generate) {
    throw new Error('Invalid provider adapter');
  }

  // Register the adapter
  providerRegistry.registerProvider(adapter);

  logger.info(`Registered custom provider: ${adapter.id} (${adapter.models.length} models)`);
}
```

Example custom provider implementation:

```typescript
/**
 * Example custom/internal provider adapter
 */
export class CustomLLMAdapter extends BaseProviderAdapter {
  private client: CustomLLMClient;

  constructor(id: string, apiUrl: string, apiKey: string) {
    const models = ['custom-model-v1', 'custom-model-v2'];
    super(id, models, apiKey, apiUrl);

    // Initialize client
    this.client = new CustomLLMClient(apiKey, apiUrl);
  }

  getCapabilities(model: string): ProviderCapabilities {
    return {
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsVision: false,
      supportsJsonMode: false,
      maxContextLength: 16384,
      tokenCountingAvailable: false
    };
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Map to custom format
      const mappedRequest = {
        modelId: request.model,
        prompt: this.formatPrompt(request.messages),
        parameters: {
          temperature: request.temperature || 0.7,
          maxTokens: request.max_tokens || 1024
        }
      };

      // Call custom API
      const result = await this.client.generateCompletion(mappedRequest);

      // Map to MCP format
      const mcpResponse = {
        id: result.id || `resp_${Date.now()}`,
        object: 'completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        provider: this.id,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: result.text
          },
          finish_reason: result.finishReason || 'stop'
        }],
        usage: {
          prompt_tokens: result.tokenUsage?.promptTokens || 0,
          completion_tokens: result.tokenUsage?.completionTokens || 0,
          total_tokens: result.tokenUsage?.totalTokens || 0
        },
        metadata: {
          latency_ms: Date.now() - startTime,
          provider_specific: {
            // Add any custom provider data here
          }
        }
      };

      // Update stats
      this.updateStats(startTime);

      return mcpResponse;
    } catch (error) {
      this.updateStats(startTime, true);
      throw this.handleError(error);
    }
  }

  async *streamGenerate(request: LLMRequest): AsyncIterableIterator<StreamingResponse> {
    // Implementation for streaming from custom provider
    // ...
  }

  private formatPrompt(messages: any[]): string {
    // Format messages into the custom provider's expected format
    // ...
  }
}
```

## Testing Provider Adapters

Each provider adapter should include comprehensive tests:

### Unit Testing

```typescript
describe('OpenAI Provider Adapter', () => {
  let adapter: OpenAIAdapter;
  let mockClient: any;

  beforeEach(() => {
    // Setup mock client
    mockClient = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };

    adapter = new OpenAIAdapter('test-key');
    // @ts-ignore - Replace client with mock
    adapter.client = mockClient;
  });

  test('generate should map request correctly', async () => {
    // Arrange
    const request: LLMRequest = {
      model: 'gpt-4',
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      temperature: 0.7,
      max_tokens: 100
    };

    mockClient.chat.completions.create.mockResolvedValue({
      id: 'test-id',
      object: 'chat.completion',
      created: Date.now() / 1000,
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hi there!'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    });

    // Act
    const result = await adapter.generate(request);

    // Assert
    expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.7,
      max_tokens: 100,
      stream: false
    });

    expect(result.choices[0].message.content).toBe('Hi there!');
    expect(result.provider).toBe('openai');
    expect(result.usage.total_tokens).toBe(30);
  });

  test('should handle errors correctly', async () => {
    // Arrange
    const request: LLMRequest = {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }]
    };

    mockClient.chat.completions.create.mockRejectedValue({
      response: {
        status: 401,
        data: {
          error: {
            message: 'Invalid API key'
          }
        }
      }
    });

    // Act & Assert
    await expect(adapter.generate(request)).rejects.toThrow('authentication_error');
  });
});
```

### Integration Testing

```typescript
describe('Provider Adapter Integration Tests', () => {
  // Note: These tests require valid API keys in environment variables

  test('OpenAI adapter should generate valid response', async () => {
    // Skip if no API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping OpenAI test - no API key');
      return;
    }

    // Arrange
    const adapter = new OpenAIAdapter(process.env.OPENAI_API_KEY);
    const request: LLMRequest = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello briefly' }],
      max_tokens: 20
    };

    // Act
    const response = await adapter.generate(request);

    // Assert
    expect(response.choices).toHaveLength(1);
    expect(response.choices[0].message.content).toBeTruthy();
    expect(response.provider).toBe('openai');
  });

  test('Anthropic adapter should generate valid response', async () => {
    // Skip if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('Skipping Anthropic test - no API key');
      return;
    }

    // Arrange
    const adapter = new AnthropicAdapter(process.env.ANTHROPIC_API_KEY);
    const request: LLMRequest = {
      model: 'claude-3-haiku',
      messages: [{ role: 'user', content: 'Say hello briefly' }],
      max_tokens: 20
    };

    // Act
    const response = await adapter.generate(request);

    // Assert
    expect(response.choices).toHaveLength(1);
    expect(response.choices[0].message.content).toBeTruthy();
    expect(response.provider).toBe('anthropic');
  });
});
```

## Best Practices

### 1. Provider Adapter Implementation

- **Isolate Provider Dependencies**: Keep provider-specific code contained within adapter
- **Thorough Validation**: Validate requests before sending to prevent provider errors
- **Detailed Error Mapping**: Map detailed provider errors to MCP format
- **Comprehensive Logging**: Log all interactions with detailed context
- **Performance Monitoring**: Track performance metrics for each provider

### 2. Feature Handling

- **Dynamic Capability Detection**: Detect provider capabilities at runtime
- **Graceful Degradation**: Fall back to alternatives when features not supported
- **Feature Emulation**: Emulate missing features where possible
- **Clear Documentation**: Document provider-specific limitations

### 3. Security Considerations

- **API Key Security**: Securely manage API keys with rotation
- **Request Validation**: Validate all inputs before passing to providers
- **Response Filtering**: Filter sensitive information from responses
- **Rate Limiting**: Implement rate limiting to prevent abuse

### 4. Optimization

- **Connection Pooling**: Reuse connections for better performance
- **Request Batching**: Batch requests where supported
- **Response Caching**: Cache responses for identical requests
- **Error Resilience**: Implement retries with exponential backoff

## Conclusion

Provider adapters are a critical component of the MCP server architecture, enabling standardized interactions with diverse LLM providers. By following the patterns and best practices in this guide, you can implement robust, secure, and efficient provider adapters for any LLM provider.

Key takeaways:

1. **Standardization**: Use consistent interfaces for all provider interactions
2. **Feature Parity**: Handle provider-specific features gracefully
3. **Security**: Implement proper credential management and validation
4. **Resilience**: Build robust error handling and recovery mechanisms
5. **Extensibility**: Design for easy addition of new providers

With these principles, your MCP server can deliver a unified experience across multiple LLM providers while taking advantage of each provider's unique capabilities.
