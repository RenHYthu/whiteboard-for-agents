# Claude API MCP 配置指南

## 🎯 你的配置格式

你提供的配置：
```json
{
    "mcpServers": {
        "whiteboard": {
            "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse"
        }
    }
}
```

这是 **Claude API** 的配置格式（不是 Claude Desktop）。

## ✅ 正确的 Claude API MCP 配置

根据 Claude 文档，正确的格式应该是：

```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
      "name": "whiteboard"
    }
  ]
}
```

### 关键变化

| 你的配置 | 正确配置 | 说明 |
|---------|---------|------|
| `mcpServers` | `mcp_servers` | ✅ 使用下划线 |
| 对象格式 `{}` | 数组格式 `[]` | ✅ 必须是数组 |
| 缺少 `type` | `"type": "url"` | ✅ 必需字段 |
| 缺少 `name` | `"name": "whiteboard"` | ✅ 必需字段 |

## 📋 完整配置示例

### 基础配置（无认证）

```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
      "name": "whiteboard"
    }
  ]
}
```

### 带认证的配置（如果需要）

```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
      "name": "whiteboard",
      "authorization_token": "YOUR_TOKEN_HERE"
    }
  ]
}
```

### 多个 MCP 服务器

```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
      "name": "whiteboard"
    },
    {
      "type": "url",
      "url": "https://another-server.com/sse",
      "name": "other-service"
    }
  ]
}
```

## 🔧 不同平台的配置对比

### 1. Claude API（你的情况）

**配置格式**:
```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
      "name": "whiteboard"
    }
  ]
}
```

**使用方式**:
```python
import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")

message = client.messages.create(
    model="claude-3-5-sonnet-20250219",
    max_tokens=1024,
    mcp_servers=[
        {
            "type": "url",
            "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
            "name": "whiteboard"
        }
    ],
    messages=[
        {"role": "user", "content": "请使用 whiteboard_read 读取白板内容"}
    ]
)
```

### 2. Claude Desktop

**配置文件**: `claude_desktop_config.json`

**配置格式**:
```json
{
  "mcpServers": {
    "whiteboard": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://whiteboard-for-agents-production-8e31.up.railway.app/sse"]
    }
  }
}
```

### 3. Claude.ai 网页版

**配置方式**: Settings > Connectors（Web 界面）

**不使用 JSON**，直接在界面填写：
- Name: `Whiteboard`
- URL: `https://whiteboard-for-agents-production-8e31.up.railway.app/mcp`（注意是 `/mcp` 不是 `/sse`）

## 🧪 测试 Claude API 配置

### Python 示例

```python
import anthropic
import os

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

# 配置 MCP 服务器
mcp_config = [
    {
        "type": "url",
        "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
        "name": "whiteboard"
    }
]

# 测试读取白板
message = client.messages.create(
    model="claude-3-5-sonnet-20250219",
    max_tokens=2048,
    mcp_servers=mcp_config,
    messages=[
        {
            "role": "user",
            "content": "请使用 whiteboard_read 工具读取白板内容"
        }
    ]
)

print(message.content)
```

### Node.js 示例

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const mcpServers = [
  {
    type: 'url',
    url: 'https://whiteboard-for-agents-production-8e31.up.railway.app/sse',
    name: 'whiteboard'
  }
];

const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20250219',
  max_tokens: 2048,
  mcp_servers: mcpServers,
  messages: [
    {
      role: 'user',
      content: '请使用 whiteboard_read 工具读取白板内容'
    }
  ]
});

console.log(message.content);
```

### cURL 示例

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-5-sonnet-20250219",
    "max_tokens": 2048,
    "mcp_servers": [
      {
        "type": "url",
        "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
        "name": "whiteboard"
      }
    ],
    "messages": [
      {
        "role": "user",
        "content": "请使用 whiteboard_read 工具读取白板内容"
      }
    ]
  }'
```

## 🔍 故障排查

### 问题 1: "Invalid mcp_servers format"

**原因**: 使用了错误的格式

❌ **错误**:
```json
{
  "mcpServers": {
    "whiteboard": {
      "url": "..."
    }
  }
}
```

✅ **正确**:
```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "...",
      "name": "whiteboard"
    }
  ]
}
```

### 问题 2: SSE 连接失败

**检查 SSE 端点**:
```bash
curl -N -H "Accept: text/event-stream" \
  https://whiteboard-for-agents-production-8e31.up.railway.app/sse
```

应该看到：
```
event: endpoint
data: /message?sessionId=...
```

### 问题 3: Tools not found

**验证服务器**:
```bash
curl https://whiteboard-for-agents-production-8e31.up.railway.app/
```

应该返回工具列表。

## 📊 字段说明

### 必需字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `type` | string | 必须是 `"url"` | `"url"` |
| `url` | string | MCP 服务器 SSE 端点（必须 HTTPS） | `"https://..."` |
| `name` | string | 唯一标识符 | `"whiteboard"` |

### 可选字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `authorization_token` | string | OAuth Bearer Token | `"sk-ant-..."` |
| `tool_configuration` | object | 工具配置和限制 | `{"allowed_tools": [...]}` |

## ✅ 快速修复

你的配置：
```json
{
    "mcpServers": {
        "whiteboard": {
            "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse"
        }
    }
}
```

修改为：
```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
      "name": "whiteboard"
    }
  ]
}
```

## 🎯 总结

| 平台 | 配置方式 | 格式 |
|------|---------|------|
| **Claude API** | 代码中传递 | `mcp_servers: [{"type": "url", ...}]` |
| **Claude Desktop** | JSON 配置文件 | `mcpServers: {"name": {"command": ...}}` |
| **Claude.ai 网页** | Web 界面 | 不需要 JSON |

你的情况应该使用 **Claude API** 的格式！

## 🔗 相关文档

- [SSE-MCP配置指南.md](./SSE-MCP配置指南.md) - Claude Desktop 配置
- [Claude.ai网页版MCP配置.md](./Claude.ai网页版MCP配置.md) - Web 版配置
