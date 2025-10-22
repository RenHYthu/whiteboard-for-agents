const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

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

// 数据持久化文件路径
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'whiteboards.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 从文件加载数据
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);

      // 恢复白板数据
      Object.keys(parsed).forEach(key => {
        whiteboards.set(key, {
          ...parsed[key],
          users: new Set(),
          lastModified: new Date(parsed[key].lastModified)
        });
      });

      console.log('数据已从文件加载');
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

// 保存数据到文件（带防抖）
let saveTimeout = null;
function saveData() {
  // 清除之前的定时器
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // 500ms 后保存，避免频繁写入
  saveTimeout = setTimeout(() => {
    try {
      const data = {};
      whiteboards.forEach((value, key) => {
        data[key] = {
          id: value.id,
          content: value.content,
          lastModified: value.lastModified
        };
      });

      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      console.log('数据已保存到文件');
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }, 500);
}

// 立即保存（不防抖）
function saveDataNow() {
  try {
    const data = {};
    whiteboards.forEach((value, key) => {
      data[key] = {
        id: value.id,
        content: value.content,
        lastModified: value.lastModified
      };
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('数据已立即保存到文件');
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

// 加载已保存的数据
loadData();

// 初始化默认白板（如果不存在）
if (!whiteboards.has(DEFAULT_BOARD_ID)) {
  whiteboards.set(DEFAULT_BOARD_ID, {
    id: DEFAULT_BOARD_ID,
    content: '',
    lastModified: new Date(),
    users: new Set()
  });
  saveData();
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

// API: 追加内容到白板
app.post('/api/whiteboard/:id/append', (req, res) => {
  const { id } = req.params;
  const { content, separator } = req.body;

  if (!content) {
    return res.status(400).json({ error: '内容不能为空' });
  }

  const whiteboard = whiteboards.get(id);

  if (!whiteboard) {
    return res.status(404).json({ error: '白板不存在' });
  }

  // 追加内容
  const sep = separator || '\n\n';
  const newContent = whiteboard.content
    ? whiteboard.content + sep + content
    : content;

  whiteboard.content = newContent;
  whiteboard.lastModified = new Date();

  // 保存到文件
  saveData();

  // 通过 WebSocket 广播给所有连接的用户
  io.to(id).emit('content-updated', {
    content: newContent,
    lastModified: whiteboard.lastModified
  });

  console.log(`白板 ${id} 内容已通过 API 追加`);

  res.json({
    success: true,
    id: whiteboard.id,
    content: whiteboard.content,
    lastModified: whiteboard.lastModified,
    contentLength: whiteboard.content.length
  });
});

// API: 替换白板全部内容
app.post('/api/whiteboard/:id/update', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (content === undefined) {
    return res.status(400).json({ error: '内容不能为空' });
  }

  const whiteboard = whiteboards.get(id);

  if (!whiteboard) {
    return res.status(404).json({ error: '白板不存在' });
  }

  // 替换内容
  whiteboard.content = content;
  whiteboard.lastModified = new Date();

  // 保存到文件
  saveData();

  // 通过 WebSocket 广播给所有连接的用户
  io.to(id).emit('content-updated', {
    content: content,
    lastModified: whiteboard.lastModified
  });

  console.log(`白板 ${id} 内容已通过 API 更新`);

  res.json({
    success: true,
    id: whiteboard.id,
    content: whiteboard.content,
    lastModified: whiteboard.lastModified,
    contentLength: whiteboard.content.length
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

    // 保存到文件
    saveData();

    // 广播给同一白板的其他用户
    socket.to(whiteboardId).emit('content-updated', {
      content,
      lastModified: whiteboard.lastModified
    });

    console.log(`白板 ${whiteboardId} 内容已更新并保存`);
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

// 优雅关闭：在进程结束前保存数据
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在保存数据...');
  saveDataNow();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在保存数据...');
  saveDataNow();
  process.exit(0);
});

// 定期保存（每30秒）
setInterval(() => {
  saveDataNow();
}, 30000);

server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
  console.log(`数据目录: ${DATA_DIR}`);
});
