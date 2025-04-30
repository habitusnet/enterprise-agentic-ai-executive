# MCP Server Implementation Guide

This guide details how to implement a Model Context Protocol (MCP) server and integrate it with Apache APISIX within our Enterprise Agentic AI Executive Platform.

## What is an MCP Server?

The Model Context Protocol (MCP) server acts as an abstraction layer between your application and various LLM providers (OpenAI, Anthropic, etc.). It provides:

1. **Unified Interface**: A standardized API for accessing multiple LLM models
2. **Model Management**: Version control and A/B testing capabilities
3. **Advanced Routing**: Direct requests to appropriate models based on requirements
4. **Fallback Mechanisms**: Automatic failover between providers
5. **Context Management**: Efficient handling of context windows across providers

## Implementation Steps

### 1. MCP Server Setup

Create a new directory for our MCP server implementation:

```bash
mkdir -p mcp_server
cd mcp_server
```

#### Basic MCP Server Structure

```
mcp_server/
├── server.js             # Main server file (Node.js example)
├── Dockerfile            # Container definition
├── package.json          # Dependencies
├── config/
│   └── models.json       # Model configuration
└── adapters/
    ├── openai.js         # OpenAI adapter
    ├── anthropic.js      # Anthropic adapter
    └── base_adapter.js   # Base adapter class
```

#### Example server.js (Node.js)

```javascript
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const modelConfig = require('./config/models.json');

// Load adapters
const OpenAIAdapter = require('./adapters/openai');
const AnthropicAdapter = require('./adapters/anthropic');

// Initialize adapters
const adapters = {
  openai: new OpenAIAdapter(process.env.OPENAI_API_KEY),
  anthropic: new AnthropicAdapter(process.env.ANTHROPIC_API_KEY)
};

// Model selection logic
function selectModel(req) {
  const requestedModel = req.body.model || 'default';
  const modelInfo = modelConfig[requestedModel];

  if (!modelInfo) {
    throw new Error(`Model ${requestedModel} not configured`);
  }

  return {
    adapter: adapters[modelInfo.provider],
    modelName: modelInfo.model_name,
    params: modelInfo.default_params
  };
}

// MCP completion endpoint
app.post('/v1/completions', async (req, res) => {
  try {
    const { adapter, modelName, params } = selectModel(req);
    const result = await adapter.generateCompletion({
      model: modelName,
      prompt: req.body.prompt,
      max_tokens: req.body.max_tokens || params.max_tokens,
      temperature: req.body.temperature || params.temperature
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCP chat completion endpoint
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { adapter, modelName, params } = selectModel(req);
    const result = await adapter.generateChatCompletion({
      model: modelName,
      messages: req.body.messages,
      max_tokens: req.body.max_tokens || params.max_tokens,
      temperature: req.body.temperature || params.temperature
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`MCP Server listening on port ${PORT}`);
});
```

### 2. APISIX Integration

To integrate the MCP server with APISIX, add a route to your APISIX configuration:

```bash
curl http://127.0.0.1:9080/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
  "id": "mcp-server",
  "uri": "/mcp/*",
  "plugins": {
    "proxy-rewrite": {
      "regex_uri": ["^/mcp/(.*)", "/$1"]
    },
    "key-auth": {
      "header": "X-API-KEY"
    },
    "prometheus": {
      "prefer_name": true
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "mcp-server:8080": 1
    }
  }
}'
```

### 3. Docker Compose Integration

Update your `docker-compose.yml` to include the MCP server:

```yaml
services:
  # ... existing services ...

  mcp-server:
    build: ./mcp_server
    container_name: mcp-server
    restart: always
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    ports:
      - "8080:8080"
    networks:
      - apisix-network
```

## Benefits Over Direct API Integration

1. **Provider Agnosticism**: Applications can use a consistent API regardless of the underlying LLM provider
2. **Centralized Management**: API keys and model configurations are managed in one place
3. **Enhanced Resilience**: Automatic failover between providers if one service is unavailable
4. **Cost Optimization**: Route requests to more cost-effective models when appropriate
5. **A/B Testing**: Test different models with the same prompts to compare results
6. **Model Versioning**: Maintain backward compatibility while introducing new model versions

## Production Considerations

1. **Scaling**: Use Kubernetes for automatic scaling based on demand
2. **Monitoring**: Integrate with Prometheus and Grafana for observability
3. **Security**: Implement robust authentication and encryption
4. **Caching**: Add response caching for frequently requested prompts
5. **Rate Limiting**: Implement provider-specific rate limiting to avoid quota issues

By implementing this MCP server with APISIX, you transform APISIX from a simple API gateway into a strategic component that provides intelligent model routing, enhances reliability, and optimizes costs across your AI operations.
