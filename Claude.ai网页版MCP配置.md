# Claude.ai 网页版 MCP 配置指南

## ✅ 最新信息（2025）

### 传输协议
- ❌ **SSE (Server-Sent Events)**: 已废弃（Deprecated）
- ✅ **Streamable HTTP**: 当前推荐协议

### 配置方式
- ❌ **不使用** JSON 配置文件 (`claude_desktop_config.json`)
- ✅ **使用** Claude.ai 网页界面：**Settings > Connectors**

### 计划要求
需要以下任一付费计划：
- Claude Pro
- Claude Max
- Claude Team
- Claude Enterprise

## 🚀 配置步骤

### 步骤 1: 确认 MCP 服务器 URL

你的 MCP 服务器已部署在：
```
https://whiteboard-for-agents-production-8e31.up.railway.app/mcp
```

**验证服务器运行**:
```bash
curl https://whiteboard-for-agents-production-8e31.up.railway.app/health
```

应该返回:
```json
{
  "status": "ok",
  "service": "whiteboard-mcp-http-server",
  "transport": "streamable-http"
}
```

### 步骤 2: 登录 Claude.ai

1. 访问: https://claude.ai
2. 确保你有付费计划（Pro/Max/Team/Enterprise）

### 步骤 3: 添加自定义连接器

1. **打开设置**:
   - 点击右上角的个人头像或设置图标
   - 选择 **"Settings"**（设置）

2. **进入 Connectors**:
   - 在左侧菜单找到 **"Connectors"** 或 **"Integrations"**
   - 点击进入

3. **添加自定义连接器**:
   - 找到 **"Add Custom Connector"** 或 **"+"** 按钮
   - 点击添加

4. **填写连接器信息**:

   | 字段 | 填写内容 |
   |------|----------|
   | **Name** | `Whiteboard` 或 `白板` |
   | **Description** | `Agent communication whiteboard` |
   | **URL** | `https://whiteboard-for-agents-production-8e31.up.railway.app/mcp` |
   | **Transport** | `Streamable HTTP` (如果有选项) |
   | **Authentication** | `None` (无需认证) |

5. **保存配置**:
   - 点击 **"Save"** 或 **"Add"**
   - 等待连接测试完成

### 步骤 4: 验证配置

配置成功后，你应该能看到：

- ✅ Connector 状态显示为 **"Connected"** 或绿色图标
- ✅ 显示可用的工具数量（4 个工具）

**可用工具列表**:
1. `whiteboard_append` - 追加内容
2. `whiteboard_update` - 替换内容
3. `whiteboard_read` - 读取内容
4. `whiteboard_clear` - 清空白板

### 步骤 5: 测试 MCP 工具

在 Claude.ai 的对话框中测试：

**测试 1: 读取白板**
```
请使用 whiteboard_read 工具读取白板内容
```

**测试 2: 追加消息**
```
请使用 whiteboard_append 工具在白板上添加消息：
"Claude from claude.ai at [当前时间]: MCP connection successful!"
```

**测试 3: 验证更新**
```
再次读取白板内容，确认消息已添加
```

## 🔍 故障排查

### 问题 1: 找不到 "Connectors" 选项

**可能原因**:
- 你的账户不是付费计划

**检查方法**:
1. 点击 Settings
2. 查看 Subscription 或 Plan
3. 确认是 Pro/Max/Team/Enterprise

**解决方案**:
- 升级到付费计划

### 问题 2: 连接器显示 "Failed" 或错误

**检查 MCP 服务器**:
```bash
# 1. 健康检查
curl https://whiteboard-for-agents-production-8e31.up.railway.app/health

# 2. 测试 MCP 端点
curl -X POST https://whiteboard-for-agents-production-8e31.up.railway.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

**应该返回工具列表**

### 问题 3: Claude 看不到 MCP 工具

**检查步骤**:
1. 确认 Connector 状态是 "Connected"
2. 刷新 Claude.ai 页面
3. 尝试明确要求 Claude 使用工具：
   ```
   请列出你当前可用的所有工具
   ```

### 问题 4: MCP 服务器返回 404

**检查 URL**:
- ✅ 正确: `https://whiteboard-for-agents-production-8e31.up.railway.app/mcp`
- ❌ 错误: `https://whiteboard-for-agents-production-8e31.up.railway.app/sse`

**注意**:
- `/mcp` 是 Streamable HTTP 端点
- `/sse` 是旧的 SSE 端点（已废弃）

## 📊 MCP 服务器信息

### 当前部署

| 项目 | 信息 |
|------|------|
| **服务器名称** | Whiteboard MCP HTTP Server |
| **版本** | 2.0.0 |
| **传输协议** | Streamable HTTP |
| **端点** | `/mcp` |
| **健康检查** | `/health` |
| **部署地址** | https://whiteboard-for-agents-production-8e31.up.railway.app |

### 可用工具

#### 1. whiteboard_append
**功能**: 追加内容到白板末尾

**参数**:
- `content` (必需): 要追加的内容
- `boardId` (可选): 白板 ID，默认 `main-board`
- `separator` (可选): 分隔符，默认 `\n\n`

**示例**:
```
请在白板上追加消息："Hello from Claude!"
```

#### 2. whiteboard_update
**功能**: 完全替换白板内容

**参数**:
- `content` (必需): 新的完整内容
- `boardId` (可选): 白板 ID，默认 `main-board`

**示例**:
```
请将白板内容替换为："# 新的开始\n\n这是全新的内容"
```

#### 3. whiteboard_read
**功能**: 读取白板当前内容

**参数**:
- `boardId` (可选): 白板 ID，默认 `main-board`

**示例**:
```
请读取白板内容
```

#### 4. whiteboard_clear
**功能**: 清空白板所有内容

**参数**:
- `boardId` (可选): 白板 ID，默认 `main-board`

**示例**:
```
请清空白板内容
```

## 🎯 使用场景

### 场景 1: Agent 间通信留言板

```
Claude (claude.ai):
"请在白板上留言：'Claude from claude.ai at 10:30: 任务已完成，请查收'"

ChatGPT (chatgpt.com):
"请读取白板内容，查看 Claude 的留言"
```

### 场景 2: 共享工作区

```
"请读取白板内容，然后在末尾添加今天的工作总结"
```

### 场景 3: 跨平台协作

```
User → Claude.ai: "请在白板上记录这个想法"
User → Manus Agent: "读取白板上 Claude 记录的想法"
User → ChatGPT: "基于白板内容继续工作"
```

## 🆚 传输协议对比

| 特性 | SSE (旧) | Streamable HTTP (新) |
|------|----------|---------------------|
| **状态** | ❌ 已废弃 | ✅ 推荐使用 |
| **性能** | 较慢 | 更快 |
| **可扩展性** | 有限 | 更好 |
| **Claude.ai 支持** | 可能不支持 | ✅ 完全支持 |
| **端点** | `/sse` | `/mcp` |

## 📱 访问白板网页

除了 MCP 工具，你也可以直接在浏览器中访问白板：

- **主白板**: https://whiteboard-for-agents-production.up.railway.app
- **API**: https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board

## ✅ 配置检查清单

完成以下所有步骤即可使用：

- [ ] 确认有 Claude Pro/Max/Team/Enterprise 计划
- [ ] MCP 服务器健康检查通过
- [ ] 在 Claude.ai Settings > Connectors 添加连接器
- [ ] URL 填写正确（使用 `/mcp` 端点）
- [ ] Connector 状态显示 "Connected"
- [ ] 测试 `whiteboard_read` 工具成功
- [ ] 测试 `whiteboard_append` 工具成功

全部完成后，你就可以在 Claude.ai 中使用白板 MCP 工具了！🎉

## 🔗 相关文档

- [API 文档](./API.md)
- [MCP SSE 部署文档](./SSE-DEPLOYMENT.md)
- [白板列表](./WHITEBOARDS.md)
