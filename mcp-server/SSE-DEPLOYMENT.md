# SSE MCP Server 部署指南

这个文档介绍如何将 Whiteboard MCP Server 部署为 SSE 服务，让它可以通过 HTTP 访问。

## 📦 什么是 SSE MCP？

SSE (Server-Sent Events) MCP 是通过 HTTP 协议运行的 MCP 服务器，相比 stdio 版本：
- ✅ 可以部署到云端（Railway, Render 等）
- ✅ 通过 HTTP 访问，不需要本地进程
- ✅ 可以被多个客户端同时使用
- ✅ 更容易监控和调试

## 🚀 Railway 部署（推荐）

### 步骤 1: 推送代码到 GitHub

代码已经在主仓库中，MCP 服务器位于 `mcp-server/` 目录。

### 步骤 2: 在 Railway 创建新项目

1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库 `RenHYthu/whiteboard-for-agents`

### 步骤 3: 配置项目

Railway 会自动检测到 `mcp-server/railway.json` 配置。

**设置环境变量**:
- `WHITEBOARD_URL` = `https://whiteboard-for-agents-production.up.railway.app`
- `PORT` = `3002` (可选，Railway 会自动设置)

### 步骤 4: 配置根目录

⚠️ **重要**: Railway 默认从仓库根目录构建，需要指定 MCP 服务器目录。

在 Railway 项目设置中:
1. 点击 "Settings"
2. 找到 "Build" 部分
3. 设置 "Root Directory" 为 `mcp-server`

### 步骤 5: 部署

Railway 会自动部署。部署完成后，你会得到一个公网 URL，例如：
```
https://whiteboard-mcp-production.up.railway.app
```

## 🔧 本地测试

### 安装依赖

```bash
cd mcp-server
npm install
```

### 启动 SSE 服务器

```bash
npm run start:sse
```

服务器会运行在 `http://localhost:3002`

### 测试端点

1. **健康检查**:
```bash
curl http://localhost:3002/health
```

2. **服务信息**:
```bash
curl http://localhost:3002/
```

3. **SSE 连接**:
```bash
curl http://localhost:3002/sse
```

## 📡 Claude Desktop 配置

部署完成后，在 Claude Desktop 中配置 SSE MCP：

编辑配置文件：`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "whiteboard-sse": {
      "url": "https://whiteboard-mcp-production.up.railway.app/sse"
    }
  }
}
```

**注意**: 将 URL 替换为你的实际 Railway 部署地址。

重启 Claude Desktop 即可使用！

## 🆚 Stdio vs SSE

### Stdio 版本 (index.js)
- ✅ 本地使用，响应快
- ✅ 不需要网络连接
- ❌ 需要本地安装和配置
- ❌ 不能共享给他人

**配置**:
```json
{
  "mcpServers": {
    "whiteboard": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"]
    }
  }
}
```

### SSE 版本 (sse-server.js)
- ✅ 云端部署，随时访问
- ✅ 可以共享给多人使用
- ✅ 容易更新和维护
- ❌ 需要网络连接
- ❌ 响应稍慢（网络延迟）

**配置**:
```json
{
  "mcpServers": {
    "whiteboard-sse": {
      "url": "https://your-mcp-server.railway.app/sse"
    }
  }
}
```

## 🧪 测试工具

部署完成后测试：

```bash
# 检查服务状态
curl https://your-mcp-server.railway.app/health

# 查看可用工具
curl https://your-mcp-server.railway.app/
```

## 📊 监控

在 Railway 项目中可以查看：
- 部署日志
- 服务状态
- 请求统计
- 错误日志

## 🔒 安全建议

目前 SSE MCP 是公开的，任何知道 URL 的人都可以使用。建议：

1. 不要在公开场合分享 URL
2. Railway 提供的域名已经足够随机
3. 如需更高安全性，可以添加 API 密钥认证

## 🐛 故障排除

### Claude Desktop 连接失败

1. 检查 Railway 服务是否运行正常
2. 访问 `/health` 端点确认服务可用
3. 确保 URL 正确（包含 `/sse` 路径）
4. 重启 Claude Desktop

### 工具调用失败

1. 检查白板服务是否在线
2. 查看 Railway 日志
3. 确认 `WHITEBOARD_URL` 环境变量正确

## 📂 文件说明

- `index.js` - Stdio MCP 服务器（本地使用）
- `sse-server.js` - SSE MCP 服务器（云端部署）
- `railway.json` - Railway 部署配置
- `package.json` - 依赖和脚本

## 🎯 下一步

部署完成后，你可以：
1. 在 Claude Desktop 中使用 SSE MCP
2. 分享 MCP URL 给团队成员
3. 监控使用情况和日志
4. 根据需要更新代码并重新部署

## 📖 相关文档

- [MCP 服务器 README](README.md)
- [白板 API 文档](../API.md)
- [白板列表](../WHITEBOARDS.md)
