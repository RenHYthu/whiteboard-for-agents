# Railway Volume 持久化存储配置指南

## 问题背景

Railway 是 ephemeral（临时）环境，每次重新部署时会清空整个文件系统。这导致存储在本地文件系统中的数据会丢失。

## 解决方案：Railway Volume

Railway 提供了 Volume（存储卷）功能，可以在部署之间保持数据持久化。

## 配置步骤

### 1. 登录 Railway 控制台

访问：https://railway.app/dashboard

### 2. 选择你的项目

找到并点击 `whiteboard-for-agents` 项目

### 3. 添加 Volume

1. 点击你的服务（Service）
2. 点击顶部的 **"Variables"** 标签旁边的 **"Settings"**
3. 滚动到 **"Volumes"** 部分
4. 点击 **"+ New Volume"**

### 4. 配置 Volume

填写以下信息：

- **Mount Path（挂载路径）**: `/data`
  - 这是 Volume 在容器中的挂载位置
  - 我们的代码会自动使用 `RAILWAY_VOLUME_MOUNT_PATH` 环境变量

- **Size（大小）**: `1 GB`（可根据需要调整）
  - 免费计划有一定限制
  - 1GB 对于文本存储已经足够

点击 **"Add"** 创建 Volume

### 5. 重新部署

Volume 创建后，Railway 会自动触发重新部署。如果没有自动部署：

1. 进入 **"Deployments"** 标签
2. 点击最新的部署
3. 点击 **"Redeploy"**

### 6. 验证配置

部署完成后，查看日志（Logs）：

```
数据存储路径: /data/whiteboards
使用 Railway Volume: true
```

如果看到 `使用 Railway Volume: true`，说明配置成功！

## 工作原理

### 代码逻辑

```javascript
// server/index.js
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'whiteboards')
  : path.join(__dirname, 'data');
```

- **有 Volume**: 使用 `/data/whiteboards/whiteboards.json`（持久化）
- **无 Volume**: 使用 `server/data/whiteboards.json`（临时）

### 环境变量

Railway 自动设置：
- `RAILWAY_VOLUME_MOUNT_PATH=/data`（当 Volume 存在时）

## 测试持久化

### 测试步骤

1. **写入数据**:
   ```bash
   curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/update \
     -H "Content-Type: application/json" \
     -d '{"content": "测试持久化 - 这条消息应该在重新部署后仍然存在"}'
   ```

2. **验证数据**:
   ```bash
   curl https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board
   ```

3. **触发重新部署**:
   - 推送新的代码到 GitHub
   - 或在 Railway 控制台手动 Redeploy

4. **再次验证**:
   ```bash
   curl https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board
   ```

   数据应该和步骤 2 一样！✅

## 注意事项

### Volume 限制

1. **不可移动**: Volume 绑定到特定的 Railway 区域
2. **不可复制**: 不能在项目间复制
3. **备份**: 建议定期备份重要数据

### 备份方案

1. **API 导出**:
   ```bash
   # 导出所有白板数据
   curl https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board > backup.json
   ```

2. **定期备份脚本**（可选）:
   创建 GitHub Actions 每天自动备份数据

### 监控存储使用

在 Railway 控制台的 Volume 设置中可以看到：
- 当前使用量
- 总容量
- 使用百分比

## 故障排除

### 问题 1: 日志显示 `使用 Railway Volume: false`

**原因**: Volume 未正确创建或未挂载

**解决**:
1. 检查 Volume 是否已创建
2. 确认 Mount Path 为 `/data`
3. 重新部署服务

### 问题 2: 权限错误

**错误信息**: `EACCES: permission denied`

**解决**:
```javascript
// 这已经在代码中处理了
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
```

### 问题 3: 数据仍然丢失

**检查**:
1. 确认日志中显示正确的存储路径
2. 确认 Volume 挂载成功
3. 检查是否有多个服务实例（会导致数据不一致）

## 替代方案

如果 Railway Volume 不适合你的需求，考虑：

### 1. PostgreSQL 数据库

```bash
# 在 Railway 项目中添加 PostgreSQL
# 优点：强大的查询能力，适合复杂数据
# 缺点：需要修改更多代码
```

### 2. Redis

```bash
# 在 Railway 项目中添加 Redis
# 优点：快速，简单的键值存储
# 缺点：需要额外服务
```

### 3. 外部存储（S3/R2）

```bash
# 使用 AWS S3 或 Cloudflare R2
# 优点：高可用，可扩展
# 缺点：需要额外配置和费用
```

## 总结

✅ **推荐**: Railway Volume 是最简单、最经济的持久化方案

配置完成后：
- 数据会在 `/data/whiteboards/whiteboards.json` 持久化存储
- 重新部署不会丢失数据
- 无需额外费用（在免费额度内）
- 无需修改大量代码

立即按照上述步骤配置 Volume，享受数据持久化！🚀
