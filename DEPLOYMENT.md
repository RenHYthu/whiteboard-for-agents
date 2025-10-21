# 部署指南

本项目支持多种部署方式，推荐使用 Railway 或 Render 进行一键部署。

## 方案一：Railway 部署（推荐，最简单）

### 步骤：

1. **注册 Railway 账号**
   - 访问 https://railway.app
   - 使用 GitHub 账号登录

2. **推送代码到 GitHub**
   ```bash
   cd "/Users/renhongyu/Documents/whiteboard for agents"
   git init
   git add .
   git commit -m "Initial commit"
   # 在 GitHub 创建仓库后
   git remote add origin <你的仓库地址>
   git push -u origin main
   ```

3. **在 Railway 创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库
   - Railway 会自动检测并部署

4. **设置环境变量**
   在 Railway 项目设置中添加：
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (可选，Railway 会自动设置)

5. **获取公网地址**
   - 部署完成后，Railway 会提供一个公网域名
   - 例如：`https://your-app.railway.app`

6. **更新前端配置**
   - 在 Railway 项目的 Variables 中添加：
   - `VITE_SERVER_URL` = `https://your-app.railway.app`

---

## 方案二：Render 部署

### 步骤：

1. **注册 Render 账号**
   - 访问 https://render.com
   - 使用 GitHub 账号登录

2. **推送代码到 GitHub**（同上）

3. **创建 Web Service**
   - 在 Render 仪表盘点击 "New +"
   - 选择 "Web Service"
   - 连接你的 GitHub 仓库

4. **配置构建设置**
   - Name: `whiteboard-app`
   - Environment: `Node`
   - Build Command: `npm install && cd client && npm install && npm run build && cd ../server && npm install`
   - Start Command: `node server/index.js`

5. **设置环境变量**
   - `NODE_ENV` = `production`
   - 部署完成后添加：
   - `VITE_SERVER_URL` = `https://your-app.onrender.com`

6. **获取公网地址**
   - 部署完成后，Render 会提供一个 `.onrender.com` 域名

---

## 方案三：Vercel + Railway（前后端分离）

### 后端部署（Railway）：
同方案一

### 前端部署（Vercel）：

1. **注册 Vercel**
   - 访问 https://vercel.com

2. **部署前端**
   ```bash
   cd client
   npm install -g vercel
   vercel
   ```

3. **设置环境变量**
   在 Vercel 项目设置中：
   - `VITE_SERVER_URL` = `https://your-backend.railway.app`

4. **重新部署**
   ```bash
   vercel --prod
   ```

---

## 本地测试生产构建

在部署前，可以本地测试生产环境：

```bash
# 构建前端
cd client
npm run build
cd ..

# 启动服务器
cd server
npm start
```

访问 http://localhost:3001

---

## 自定义域名

### Railway:
1. 在项目设置中点击 "Settings"
2. 在 "Domains" 部分添加自定义域名
3. 按照提示配置 DNS

### Render:
1. 在项目设置中点击 "Custom Domain"
2. 添加你的域名
3. 配置 DNS CNAME 记录

---

## 常见问题

### 1. WebSocket 连接失败
确保：
- 服务器支持 WebSocket（Railway 和 Render 都支持）
- CORS 配置正确
- 使用 HTTPS（生产环境）

### 2. 页面一直加载
- 检查浏览器控制台错误
- 确认 `VITE_SERVER_URL` 环境变量正确
- 确认后端服务正常运行

### 3. 内容不同步
- 检查 Socket.IO 连接状态
- 查看服务器日志

---

## 推荐配置

- **免费部署**: Railway（500小时/月免费）或 Render（免费套餐）
- **最佳性能**: Vercel (前端) + Railway (后端)
- **最简单**: Railway 一键部署

选择 Railway 即可获得：
✅ 免费公网域名
✅ 自动 HTTPS
✅ 支持 WebSocket
✅ 自动部署（Git push 触发）
