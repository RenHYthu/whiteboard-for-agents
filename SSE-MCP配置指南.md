# SSE MCP 服务器配置指南

## 📋 SSE 服务器信息

### 部署地址
```
https://whiteboard-for-agents-production-8e31.up.railway.app
```

### 端点
- **SSE 端点**: `/sse`
- **健康检查**: `/health`
- **信息**: `/`

### 验证服务器状态

```bash
# 健康检查
curl https://whiteboard-for-agents-production-8e31.up.railway.app/health

# 应该返回:
{
  "status": "ok",
  "service": "whiteboard-mcp-sse-server"
}
```

```bash
# 服务器信息
curl https://whiteboard-for-agents-production-8e31.up.railway.app/

# 应该返回:
{
  "name": "Whiteboard MCP SSE Server",
  "version": "1.0.0",
  "description": "SSE-based MCP server for whiteboard API integration",
  "endpoints": {
    "health": "/health",
    "sse": "/sse"
  },
  "tools": [
    "whiteboard_append",
    "whiteboard_update",
    "whiteboard_read",
    "whiteboard_clear"
  ]
}
```

## 🔧 配置方式

### 方法 1: Claude Desktop（stdio + npx mcp-remote）

这是最推荐的本地使用方式。

**配置文件位置**:
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

**重启 Claude Desktop** 后生效。

### 方法 2: 使用 mcp-proxy（如果 mcp-remote 不工作）

```bash
# 安装 mcp-proxy
npm install -g mcp-proxy
```

**配置**:
```json
{
  "mcpServers": {
    "whiteboard": {
      "command": "mcp-proxy",
      "args": [
        "https://whiteboard-for-agents-production-8e31.up.railway.app/sse"
      ]
    }
  }
}
```

### 方法 3: 直接 SSE 连接（编程使用）

对于其他应用程序（非 Claude Desktop）：

```javascript
// Node.js 示例
import EventSource from 'eventsource';

const sse = new EventSource('https://whiteboard-for-agents-production-8e31.up.railway.app/sse');

sse.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

sse.onerror = (error) => {
  console.error('SSE 错误:', error);
};
```

```python
# Python 示例
import sseclient
import requests

response = requests.get(
    'https://whiteboard-for-agents-production-8e31.up.railway.app/sse',
    stream=True,
    headers={'Accept': 'text/event-stream'}
)

client = sseclient.SSEClient(response)
for event in client.events():
    print(f'收到事件: {event.data}')
```

## 🧪 测试 SSE 连接

### 测试 1: curl 测试

```bash
curl -N -H "Accept: text/event-stream" \
  https://whiteboard-for-agents-production-8e31.up.railway.app/sse
```

**预期输出**（会持续输出）:
```
event: endpoint
data: /message?sessionId=xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

按 `Ctrl+C` 停止。

### 测试 2: Claude Desktop 验证

配置完成后，在 Claude Desktop 中：

1. 重启 Claude Desktop
2. 在对话中输入：
   ```
   你可以看到 whiteboard 相关的工具吗？
   ```
3. 应该能看到 4 个工具
4. 测试读取：
   ```
   请使用 whiteboard_read 工具读取白板内容
   ```

## 🛠️ 可用工具

### 1. whiteboard_append
追加内容到白板末尾

```
请在白板上追加消息："Hello from SSE MCP!"
```

### 2. whiteboard_update
完全替换白板内容

```
请将白板内容替换为："# 新标题\n\n这是新内容"
```

### 3. whiteboard_read
读取白板当前内容

```
请读取白板内容
```

### 4. whiteboard_clear
清空白板

```
请清空白板
```

## 🔍 故障排查

### 问题 1: Claude Desktop 看不到工具

**检查步骤**:

1. **验证配置文件路径**:
   ```bash
   # Mac
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Windows
   type %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **验证 JSON 格式**:
   - 使用在线工具验证 JSON 格式是否正确
   - 确保没有多余的逗号或引号

3. **检查 Claude Desktop 版本**:
   - 确保使用最新版本
   - Help > About Claude

4. **查看日志**:
   - Mac: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

### 问题 2: SSE 连接失败

**诊断**:

```bash
# 1. 检查服务器是否运行
curl https://whiteboard-for-agents-production-8e31.up.railway.app/health

# 2. 测试 SSE 端点
curl -N -H "Accept: text/event-stream" \
  https://whiteboard-for-agents-production-8e31.up.railway.app/sse

# 3. 检查是否有防火墙/代理拦截
```

**可能原因**:
- 防火墙阻止 SSE 连接
- 公司网络限制
- VPN 干扰

**解决方案**:
- 关闭 VPN 测试
- 检查防火墙设置
- 尝试不同的网络环境

### 问题 3: mcp-remote 安装失败

```bash
# 手动安装
npm install -g mcp-remote

# 验证安装
which mcp-remote  # Mac/Linux
where mcp-remote  # Windows
```

如果还是失败，使用完整路径：

```json
{
  "mcpServers": {
    "whiteboard": {
      "command": "/usr/local/bin/npx",
      "args": ["-y", "mcp-remote", "https://..."]
    }
  }
}
```

### 问题 4: 工具调用失败

**检查白板 API**:

```bash
# 测试白板 API
curl https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board

# 应该返回白板内容
```

**检查 MCP 服务器日志**:
- 在 Railway Dashboard 查看 MCP 服务器的日志
- Deployments > 最新部署 > View Logs

## 📊 SSE vs HTTP 对比

| 特性 | SSE | Streamable HTTP |
|------|-----|-----------------|
| **使用场景** | Claude Desktop 本地 | Claude.ai 网页版 |
| **配置方式** | JSON 配置文件 | Web UI 界面 |
| **代理工具** | npx mcp-remote | 不需要 |
| **连接方式** | 长连接（EventSource） | HTTP POST |
| **适合** | 本地开发、测试 | 云端生产环境 |

## 🎯 推荐配置

### 场景 1: 本地使用 Claude Desktop

✅ **使用 SSE**
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

### 场景 2: 使用 claude.ai 网页版

❌ **SSE 不支持**（需要使用 Streamable HTTP）

参考：[Claude.ai网页版MCP配置.md](./Claude.ai网页版MCP配置.md)

### 场景 3: 自定义应用集成

✅ **直接使用 SSE**
```javascript
const sse = new EventSource('https://whiteboard-for-agents-production-8e31.up.railway.app/sse');
```

## ✅ 配置检查清单

- [ ] SSE 服务器健康检查通过
- [ ] curl 测试 SSE 端点成功
- [ ] Claude Desktop 配置文件格式正确
- [ ] 已重启 Claude Desktop
- [ ] Claude Desktop 显示 whiteboard 工具
- [ ] 成功调用 whiteboard_read 测试
- [ ] 成功调用 whiteboard_append 测试

全部完成即可正常使用！

## 📞 需要帮助？

如果遇到问题：

1. 查看 Railway 日志
2. 检查 Claude Desktop 日志
3. 提供具体的错误信息
4. 发送配置文件内容（去除敏感信息）

## 🔗 相关文档

- [API.md](./API.md) - HTTP API 文档
- [SSE-DEPLOYMENT.md](./SSE-DEPLOYMENT.md) - SSE 部署详情
- [WHITEBOARDS.md](./WHITEBOARDS.md) - 多白板使用
- [Claude.ai网页版MCP配置.md](./Claude.ai网页版MCP配置.md) - Web 版配置（HTTP）
