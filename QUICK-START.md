# 🚀 白板持久化存储 - 快速开始

## 现状

❌ **当前问题**: Railway 重新部署后数据丢失

✅ **解决方案**: 配置 Railway Volume（5 分钟）

## 立即行动（3 步）

### 步骤 1: 打开 Railway

```
https://railway.app/dashboard
→ 点击 whiteboard-for-agents 项目
→ 点击你的服务
→ 点击 Settings 标签
```

### 步骤 2: 创建 Volume

```
向下滚动到 "Volumes" 部分
→ 点击 "+ New Volume"
→ Mount Path: /data
→ Size: 1 GB
→ 点击 "Add"
```

### 步骤 3: 等待部署完成

```
自动重新部署（2-3 分钟）
→ 查看 Logs
→ 确认看到: "使用 Railway Volume: true"
```

## 验证成功

打开浏览器控制台日志或 Railway 日志，应该看到：

```
数据存储路径: /data/whiteboards
使用 Railway Volume: true
```

## 测试持久化

```bash
# 1. 写入测试数据
curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/update \
  -H "Content-Type: application/json" \
  -d '{"content": "持久化测试成功！"}'

# 2. 在 Railway 手动 Redeploy

# 3. 验证数据还在
curl https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board
# 应该看到: "持久化测试成功！"
```

## 详细文档

- 🇨🇳 **中文详细指南**: [配置持久化存储.md](./配置持久化存储.md)
- 🇬🇧 **English Guide**: [RAILWAY-VOLUME-SETUP.md](./RAILWAY-VOLUME-SETUP.md)

## 工作原理

```
┌─────────────────────────────────────────┐
│  Railway Container (ephemeral)          │
│  ┌────────────────────────────────────┐ │
│  │ /app                               │ │
│  │  ├── server/                       │ │
│  │  │   └── data/ ❌ 临时存储         │ │
│  │  └── ...                           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ /data ✅ Volume 持久化存储          │ │
│  │  └── whiteboards/                  │ │
│  │      └── whiteboards.json          │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
         ↑
         │ 重新部署后保留
         └── Volume 数据永久保存
```

## 状态检查

配置前:
```
✅ 代码已更新（自动支持 Volume）
❌ Volume 未配置
❌ 数据会丢失
```

配置后:
```
✅ 代码已更新
✅ Volume 已配置
✅ 数据持久化
```

## 需要帮助？

查看常见问题：[配置持久化存储.md](./配置持久化存储.md#-常见问题)
