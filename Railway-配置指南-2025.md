# Railway Volume 配置指南（2025 最新版本）

## 🎯 目标

配置 Volume 让白板数据在重新部署后不丢失

## 📍 如何创建 Volume（2 种方法）

### 方法 1：使用命令面板（推荐）

1. **打开项目**: https://railway.app/dashboard → 点击 `whiteboard-for-agents` 项目

2. **打开命令面板**:
   - Mac: 按 `⌘K` (Command + K)
   - Windows/Linux: 按 `Ctrl+K`

3. **搜索创建 Volume**:
   - 在命令面板中输入: `volume` 或 `create volume`
   - 选择 **"Create Volume"** 或类似选项

4. **配置 Volume**:
   - **Select Service**: 选择你的服务（通常显示为 `main` 或服务名称）
   - **Mount Path**: 填写 `/data`
   - **Size**: 保持默认或填写 `1` GB

5. **确认创建**: 点击确认按钮

### 方法 2：右键菜单

1. **打开项目**: https://railway.app/dashboard → 点击 `whiteboard-for-agents` 项目

2. **进入项目画布**: 你应该看到你的服务显示为一个卡片/方块

3. **右键点击空白处**: 在项目画布的空白区域右键点击

4. **选择创建 Volume**: 在弹出的菜单中找到并点击 **"New Volume"** 或 **"Add Volume"**

5. **配置 Volume** (同方法 1):
   - **Select Service**: 选择你的服务
   - **Mount Path**: 填写 `/data`
   - **Size**: 1 GB

6. **确认创建**

## ⚠️ 重要配置项

| 配置项 | 必须填写 | 说明 |
|--------|----------|------|
| **Mount Path** | `/data` | 必须是 `/data`，不能改！代码会自动检测这个路径 |
| **Service** | 你的服务名 | 选择运行白板的服务 |
| **Size** | 1 GB | 可根据需要调整，1GB 足够存储大量文本 |

## 🔍 创建后自动发生的事情

1. ✅ Railway 自动设置环境变量:
   - `RAILWAY_VOLUME_NAME`
   - `RAILWAY_VOLUME_MOUNT_PATH=/data`

2. ✅ 自动触发重新部署（需要 2-3 分钟）

3. ✅ 我们的代码自动检测并使用 Volume 存储

## ✅ 验证配置成功

### 步骤 1: 查看部署日志

1. 在 Railway 项目中，点击你的服务
2. 点击 **"Deployments"** 标签
3. 点击最新的部署
4. 查看 **"Logs"**（日志）

应该看到：
```
数据存储路径: /data/whiteboards
使用 Railway Volume: true
```

✅ 看到 `使用 Railway Volume: true` = 配置成功！

### 步骤 2: 测试数据持久化

**写入测试数据**:
```bash
curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/update \
  -H "Content-Type: application/json" \
  -d '{"content": "测试持久化 - 时间: '$(date +%Y-%m-%d\ %H:%M:%S)'\n\n如果重新部署后这条消息还在，说明持久化成功！"}'
```

**手动触发重新部署**:
1. 在 Railway 中，点击服务
2. 点击 **"Deployments"**
3. 点击最新部署右上角的三个点 `...`
4. 选择 **"Redeploy"**
5. 等待部署完成（2-3 分钟）

**验证数据还在**:
```bash
curl https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board
```

如果看到刚才写入的测试数据，说明持久化成功！🎉

## 🖼️ Railway 新版界面说明

```
Railway 项目页面
┌─────────────────────────────────────────────────────┐
│  [项目名称]                                          │
│                                                      │
│  ┌──────────────┐         ┌──────────────┐         │
│  │   Service    │  ◀─连接  │   Volume     │         │
│  │ (你的服务)    │         │   (新创建)    │         │
│  └──────────────┘         └──────────────┘         │
│                                                      │
│  右键点击空白处 → New Volume                         │
│  或按 ⌘K → Create Volume                            │
└─────────────────────────────────────────────────────┘
```

## ❓ 找不到 Volume 功能？

### 可能的原因和解决方法

1. **使用的是免费计划**
   - Railway 免费计划应该支持 Volume
   - 如果看不到，可能需要添加支付方式（即使不会收费）

2. **项目类型不支持**
   - 确认你的项目是标准的 Railway 项目
   - 不是 GitHub 直接部署的简化版本

3. **UI 位置变化**
   - 尝试两种方法：`⌘K` 命令面板 或 右键菜单
   - 在服务的 Settings 页面查找 Storage/Volumes 相关选项

4. **刷新页面**
   - Railway 有时需要刷新才能看到新功能
   - 尝试退出登录再重新登录

## 🆘 替代方案

如果实在找不到 Volume 功能，可以使用以下替代方案：

### 方案 A: 使用 Railway PostgreSQL

1. 在项目中添加 PostgreSQL 数据库
2. 修改代码使用数据库存储（需要更多代码修改）

### 方案 B: 使用外部存储

1. 使用 Cloudflare R2（有免费额度）
2. 使用 AWS S3
3. 修改代码使用对象存储

### 方案 C: 接受临时存储

1. 保持当前代码（有默认内容初始化）
2. 每次部署后会恢复到默认内容
3. 重要数据通过 API 定期备份

## 📞 联系 Railway 支持

如果以上方法都不行：

1. 访问: https://help.railway.app
2. 点击右下角的聊天图标
3. 询问: "How do I add a Volume to my service?"

## 📚 官方文档

- Volume 使用指南: https://docs.railway.com/guides/volumes
- Volume 参考文档: https://docs.railway.com/reference/volumes

## ✅ 完成检查

- [ ] 已尝试 `⌘K` 命令面板创建 Volume
- [ ] 已尝试右键菜单创建 Volume
- [ ] Volume 已成功创建并连接到服务
- [ ] Mount Path 设置为 `/data`
- [ ] 日志显示 `使用 Railway Volume: true`
- [ ] 测试数据持久化成功

全部完成就大功告成！🎊
