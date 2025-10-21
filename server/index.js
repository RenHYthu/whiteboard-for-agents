const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// 存储白板数据
const whiteboards = new Map();

// 默认白板 ID
const DEFAULT_BOARD_ID = 'main-board';

// 初始化默认白板
if (!whiteboards.has(DEFAULT_BOARD_ID)) {
  whiteboards.set(DEFAULT_BOARD_ID, {
    id: DEFAULT_BOARD_ID,
    content: '',
    lastModified: new Date(),
    users: new Set()
  });
}

// API 路由
app.get('/api/whiteboard/:id', (req, res) => {
  const { id } = req.params;
  const whiteboard = whiteboards.get(id);
  
  if (!whiteboard) {
    return res.status(404).json({ error: '白板不存在' });
  }
  
  res.json({
    id: whiteboard.id,
    content: whiteboard.content,
    lastModified: whiteboard.lastModified,
    userCount: whiteboard.users.size
  });
});

app.post('/api/whiteboard', (req, res) => {
  const id = uuidv4();
  const whiteboard = {
    id,
    content: '',
    lastModified: new Date(),
    users: new Set()
  };
  
  whiteboards.set(id, whiteboard);
  
  res.json({
    id: whiteboard.id,
    content: whiteboard.content,
    lastModified: whiteboard.lastModified,
    userCount: 0
  });
});

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  // 加入白板
  socket.on('join-whiteboard', (whiteboardId) => {
    const boardId = whiteboardId || DEFAULT_BOARD_ID;
    const whiteboard = whiteboards.get(boardId);
    
    if (!whiteboard) {
      socket.emit('error', { message: '白板不存在' });
      return;
    }
    
    socket.join(boardId);
    whiteboard.users.add(socket.id);
    
    // 发送当前内容给新用户
    socket.emit('whiteboard-content', {
      content: whiteboard.content,
      lastModified: whiteboard.lastModified
    });
    
    // 通知其他用户有新用户加入
    socket.to(boardId).emit('user-joined', {
      userCount: whiteboard.users.size
    });
    
    console.log(`用户 ${socket.id} 加入白板 ${boardId}`);
  });
  
  // 处理内容更新
  socket.on('content-update', (data) => {
    const { whiteboardId, content } = data;
    const whiteboard = whiteboards.get(whiteboardId);
    
    if (!whiteboard) {
      socket.emit('error', { message: '白板不存在' });
      return;
    }
    
    // 更新内容
    whiteboard.content = content;
    whiteboard.lastModified = new Date();
    
    // 广播给同一白板的其他用户
    socket.to(whiteboardId).emit('content-updated', {
      content,
      lastModified: whiteboard.lastModified
    });
    
    console.log(`白板 ${whiteboardId} 内容已更新`);
  });
  
  // 用户断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
    
    // 从所有白板中移除用户
    whiteboards.forEach((whiteboard) => {
      if (whiteboard.users.has(socket.id)) {
        whiteboard.users.delete(socket.id);
        
        // 通知其他用户用户离开
        socket.to(whiteboard.id).emit('user-left', {
          userCount: whiteboard.users.size
        });
      }
    });
  });
});

// 服务前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
});
