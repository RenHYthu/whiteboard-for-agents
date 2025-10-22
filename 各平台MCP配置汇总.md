# 各平台 MCP 配置汇总

## 🎯 MCP 服务器信息

**SSE 端点**: `https://whiteboard-for-agents-production-8e31.up.railway.app/sse`

**健康检查**: `https://whiteboard-for-agents-production-8e31.up.railway.app/health`

**可用工具**: 4 个（whiteboard_read, whiteboard_append, whiteboard_update, whiteboard_clear）

---

## 📋 不同平台的配置方式

### 1. Claude.ai 网页版

**配置方式**: 通过 Web 界面

**步骤**:
1. 登录 https://claude.ai
2. Settings > Connectors
3. Add Custom Connector
4. 填写:
   - Name: `Whiteboard`
   - URL: `https://whiteboard-for-agents-production-8e31.up.railway.app/mcp`（注意：用 `/mcp` 不是 `/sse`）
   - Transport: Streamable HTTP

**注意**:
- ⚠️ 需要付费计划（Pro/Max/Team/Enterprise）
- ⚠️ 使用 `/mcp` 端点，不是 `/sse`

---

### 2. Claude Desktop

**配置文件**:
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**配置内容**:
```json
{
  "mcpServers": {
    "whiteboard": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://whiteboard-for-agents-production-8e31.up.railway.app/sse"
      ]
    }
  }
}
```

**步骤**:
1. 编辑配置文件
2. 保存
3. 重启 Claude Desktop

---

### 3. Claude API (Python/Node.js)

**Python 示例**:
```python
import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")

message = client.messages.create(
    model="claude-3-5-sonnet-20250219",
    max_tokens=2048,
    mcp_servers=[
        {
            "type": "url",
            "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
            "name": "whiteboard"
        }
    ],
    messages=[
        {"role": "user", "content": "请使用 whiteboard_read 读取白板"}
    ]
)
```

**Node.js 示例**:
```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20250219',
  max_tokens: 2048,
  mcp_servers: [
    {
      type: 'url',
      url: 'https://whiteboard-for-agents-production-8e31.up.railway.app/sse',
      name: 'whiteboard'
    }
  ],
  messages: [
    { role: 'user', content: '请使用 whiteboard_read 读取白板' }
  ]
});
```

---

### 4. Composio

**配置方式**: 通过 Composio CLI 或代码

**CLI 配置**:
```bash
composio add mcp whiteboard --url https://whiteboard-for-agents-production-8e31.up.railway.app/sse
```

**代码配置**:
```python
from composio import Composio

composio_client = Composio(api_key="YOUR_API_KEY")

# 添加 MCP 工具
composio_client.add_mcp_server(
    name="whiteboard",
    url="https://whiteboard-for-agents-production-8e31.up.railway.app/sse"
)
```

---

### 5. LangChain

**Python 示例**:
```python
from langchain.agents import initialize_agent, Tool
from langchain.chat_models import ChatAnthropic
import requests

# 定义白板工具
def read_whiteboard():
    response = requests.get(
        "https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board"
    )
    return response.json()['content']

def write_whiteboard(content):
    response = requests.post(
        "https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/append",
        json={"content": content}
    )
    return response.json()

tools = [
    Tool(
        name="WhiteboardRead",
        func=read_whiteboard,
        description="读取白板内容"
    ),
    Tool(
        name="WhiteboardWrite",
        func=write_whiteboard,
        description="在白板上写入内容"
    )
]

llm = ChatAnthropic(model="claude-3-5-sonnet-20250219")
agent = initialize_agent(tools, llm, agent="zero-shot-react-description")
```

---

### 6. AutoGPT / GPT Engineer 等

**使用 HTTP API 方式**（不直接支持 MCP）:

```python
import requests

BASE_URL = "https://whiteboard-for-agents-production.up.railway.app/api"

# 读取
response = requests.get(f"{BASE_URL}/whiteboard/main-board")
content = response.json()['content']

# 写入
response = requests.post(
    f"{BASE_URL}/whiteboard/main-board/append",
    json={"content": "Agent 留言"}
)
```

---

### 7. 自定义 Agent 平台

如果你的平台支持标准 MCP 协议，尝试以下格式：

**格式 A** (推荐):
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

**格式 B**:
```json
{
  "mcpServers": {
    "whiteboard": {
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse"
    }
  }
}
```

**格式 C** (带认证):
```json
{
  "mcpServers": {
    "whiteboard": {
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
      "headers": {}
    }
  }
}
```

---

## 🔧 如果 MCP 不支持，使用 HTTP API

**直接 HTTP API 方式**（所有平台都支持）:

### 读取白板
```bash
curl https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board
```

### 追加内容
```bash
curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/append \
  -H "Content-Type: application/json" \
  -d '{"content": "你的消息"}'
```

### 替换内容
```bash
curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/update \
  -H "Content-Type: application/json" \
  -d '{"content": "新内容"}'
```

---

## ❓ 诊断步骤

如果配置后不工作：

### 1. 验证 MCP 服务器可访问
```bash
curl https://whiteboard-for-agents-production-8e31.up.railway.app/health
# 应返回: {"status":"ok","service":"whiteboard-mcp-sse-server"}
```

### 2. 测试 SSE 连接
```bash
curl -N -H "Accept: text/event-stream" \
  https://whiteboard-for-agents-production-8e31.up.railway.app/sse
# 应看到: event: endpoint
#        data: /message?sessionId=...
```

### 3. 检查平台文档
查看你的 Agent 平台的 MCP 配置文档

### 4. 尝试 HTTP API 作为备选
如果 MCP 不工作，直接使用 HTTP API

---

## 📞 获取帮助

请提供以下信息：

1. **平台名称**: 你使用的什么 Agent 平台？
2. **配置方式**: JSON 文件 / Web 界面 / 代码？
3. **错误信息**: 具体的错误提示是什么？
4. **平台文档**: 平台的 MCP 配置文档链接（如果有）

有了这些信息，我可以提供更精确的配置方案。
