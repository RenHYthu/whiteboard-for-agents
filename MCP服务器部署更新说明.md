# MCP 服务器部署更新说明

## 📋 已完成的更新

### 1. 添加 Streamable HTTP 支持

**新文件**: `mcp-server/http-server.js`

- ✅ 创建了全新的 HTTP 服务器，使用 Streamable HTTP 传输协议
- ✅ 更新 MCP SDK 从 0.5.0 → 1.20.1
- ✅ 实现 `/mcp` 端点（Claude.ai 云端推荐）
- ✅ 保留 `/sse` 端点（兼容性）

### 2. 更新的文件

| 文件 | 变更 |
|------|------|
| `http-server.js` | ✅ 新建 - Streamable HTTP 服务器 |
| `package.json` | ✅ 更新 - SDK 版本 + 新启动脚本 |
| `package-lock.json` | ✅ 更新 - 依赖锁定 |
| `railway.json` | ✅ 更新 - 启动命令改为 `http-server.js` |

### 3. 本地测试结果

```bash
$ node mcp-server/http-server.js
Whiteboard MCP HTTP Server 运行在端口 3002
MCP 端点: http://localhost:3002/mcp
健康检查: http://localhost:3002/health
传输协议: Streamable HTTP (推荐用于 Claude.ai)

$ curl http://localhost:3002/health
{"status":"ok","service":"whiteboard-mcp-http-server","transport":"streamable-http"}
```

✅ 本地测试通过

## 🚨 重要: Railway 部署配置

### 问题

你的 MCP 服务器部署在:
```
https://whiteboard-for-agents-production-8e31.up.railway.app
```

但我发现 `mcp-server/.git` 目录没有配置远程仓库。

### 需要确认

请告诉我以下信息：

1. **MCP 服务器的 Railway 项目**连接到哪个 GitHub 仓库？
   - A. 主仓库 `RenHYthu/whiteboard-for-agents`（但在子目录）
   - B. 独立仓库 `RenHYthu/mcp-server`（需要创建）
   - C. 其他仓库

2. **Railway 项目配置**:
   - 是否设置了 "Root Directory" 为 `mcp-server`？
   - 还是整个仓库都部署了？

### 部署方案

#### 方案 A: 主仓库 + Root Directory

如果 Railway 项目设置为：
- **Repository**: `RenHYthu/whiteboard-for-agents`
- **Root Directory**: `mcp-server`

那么：
- ✅ 代码已经推送到 GitHub（刚才的 commit）
- ✅ Railway 会自动检测到更新并重新部署
- ⏳ 等待 2-3 分钟部署完成

#### 方案 B: 独立仓库（推荐）

如果你想要独立的 MCP 服务器仓库：

```bash
# 1. 在 GitHub 创建新仓库: whiteboard-mcp-server

# 2. 配置远程仓库
cd "mcp-server"
git remote add origin https://github.com/RenHYthu/whiteboard-mcp-server.git
git branch -M main
git push -u origin main

# 3. 在 Railway 项目中更改仓库连接
# Settings > Source > Change Repository
```

#### 方案 C: 手动触发部署

如果不确定配置：

1. **登录 Railway Dashboard**: https://railway.app/dashboard
2. **找到 MCP 服务器项目**
3. **点击 Settings > Deployments**
4. **手动触发 Redeploy**

## ✅ 部署验证步骤

### 步骤 1: 等待部署完成

访问 Railway 项目的 Deployments 页面，等待状态变为 ✅

### 步骤 2: 验证健康检查

```bash
curl https://whiteboard-for-agents-production-8e31.up.railway.app/health
```

**预期输出**:
```json
{
  "status": "ok",
  "service": "whiteboard-mcp-http-server",
  "transport": "streamable-http"
}
```

🔍 **关键检查点**: `service` 应该显示 `whiteboard-mcp-http-server`（不是 `whiteboard-mcp-sse-server`）

### 步骤 3: 测试 MCP 端点

```bash
curl https://whiteboard-for-agents-production-8e31.up.railway.app/
```

**预期输出**:
```json
{
  "name": "Whiteboard MCP HTTP Server",
  "version": "2.0.0",
  "transport": "streamable-http",
  "endpoints": {
    "health": "/health",
    "mcp": "/mcp"
  },
  "tools": [
    "whiteboard_append",
    "whiteboard_update",
    "whiteboard_read",
    "whiteboard_clear"
  ]
}
```

### 步骤 4: 测试工具列表

```bash
curl -X POST https://whiteboard-for-agents-production-8e31.up.railway.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

应该返回 4 个工具的列表。

## 🎯 Claude.ai 配置步骤

部署成功后，在 Claude.ai 网页版配置：

### 步骤 1: 打开设置

1. 访问: https://claude.ai
2. 点击右上角设置图标
3. 进入 **Settings > Connectors**

### 步骤 2: 添加连接器

点击 **"Add Custom Connector"** 或 **"+"**

填写信息：

| 字段 | 填写内容 |
|------|----------|
| **Name** | `Whiteboard` |
| **URL** | `https://whiteboard-for-agents-production-8e31.up.railway.app/mcp` |
| **Transport** | `Streamable HTTP` |
| **Authentication** | `None` |

### 步骤 3: 保存并测试

保存后，在 Claude 对话中测试：

```
请使用 whiteboard_read 工具读取白板内容
```

## 📊 传输协议对比

| 特性 | SSE (旧) | Streamable HTTP (新) |
|------|----------|---------------------|
| **端点** | `/sse` | `/mcp` |
| **状态** | ❌ 已废弃 | ✅ 当前推荐 |
| **Claude.ai 支持** | 可能不支持 | ✅ 完全支持 |
| **性能** | 较慢 | 更快 |
| **Railway 启动** | `node sse-server.js` | `node http-server.js` |

## 🔄 回滚方案

如果新版本有问题，可以快速回滚：

```bash
# 在 Railway 项目中
# Settings > Deployments
# 找到之前的成功部署
# 点击 "..." > "Redeploy"
```

或者修改 `railway.json`:

```json
{
  "deploy": {
    "startCommand": "node sse-server.js"
  }
}
```

然后推送更新。

## 📝 完成检查清单

- [ ] 确认 Railway 部署的 GitHub 仓库配置
- [ ] 代码已推送到正确的仓库
- [ ] Railway 自动部署完成（或手动触发）
- [ ] 健康检查返回 `whiteboard-mcp-http-server`
- [ ] MCP 端点返回工具列表
- [ ] 在 Claude.ai 添加连接器
- [ ] 在 Claude.ai 测试工具调用成功

## 🆘 需要帮助？

如果遇到问题：

1. 查看 Railway 部署日志
2. 检查是否是仓库配置问题
3. 提供错误信息，我帮你诊断

## 📚 相关文档

- [Claude.ai网页版MCP配置.md](./Claude.ai网页版MCP配置.md) - 完整的 Claude.ai 配置指南
- [API.md](./API.md) - HTTP API 文档
- [WHITEBOARDS.md](./WHITEBOARDS.md) - 多白板使用指南
