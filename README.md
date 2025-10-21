# 白板项目

一个极简的在线白板，任何人都可以访问并编辑纯文本内容，内容存储在服务端。

## 功能特性

- 🌐 **公开访问**: 任何人都可以访问网站
- ✍️ **纯文本编辑**: 简洁的文本编辑界面
- 👥 **实时协作**: 多人可以同时编辑，内容实时同步
- 💾 **服务端存储**: 内容存储在服务端，重启后保持
- 📱 **响应式设计**: 支持各种设备访问

## 技术栈

### 后端 (Backend)
- Node.js + Express
- Socket.io (WebSocket 实时通信)
- 内存存储 (可扩展为数据库)

### 前端 (Frontend)
- React + TypeScript
- Tailwind CSS (样式)

## 快速开始

### 安装依赖
```bash
npm run install:all
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

## 项目结构

```
whiteboard-for-agents/
├── server/          # 后端服务
├── client/          # 前端应用
├── package.json     # 根项目配置
└── README.md        # 项目说明
```

## 部署说明

1. 构建前端应用: `npm run build`
2. 启动后端服务: `npm start`
3. 访问 http://localhost:3000

## 许可证

MIT License
