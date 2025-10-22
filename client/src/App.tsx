import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [boardId, setBoardId] = useState<string>('main-board');

  useEffect(() => {
    // 从 URL 路径获取白板 ID
    const path = window.location.pathname;
    const pathBoardId = path.slice(1) || 'main-board'; // 去掉开头的 '/'
    setBoardId(pathBoardId);

    console.log('初始化白板，ID:', pathBoardId);

    // 超时保护：5秒后自动停止加载
    const loadingTimeout = setTimeout(() => {
      console.log('加载超时，显示编辑器');
      setIsLoading(false);
    }, 5000);

    // 初始化 Socket.IO 连接
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    console.log('连接到服务器:', serverUrl);

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    // 监听来自其他页面的消息（ChatGPT 内容）
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'WRITE_CONTENT') {
        console.log('收到 ChatGPT 内容:', event.data.content);
        // 使用函数式更新避免闭包问题
        setContent((prevContent) => {
          const newContent = prevContent + '\n\n' + event.data.content;
          newSocket.emit('content-update', {
            whiteboardId: pathBoardId,
            content: newContent
          });
          return newContent;
        });
      }
    };

    window.addEventListener('message', handleMessage);

    // 连接事件 - 必须在 io() 之后立即注册
    newSocket.on('connect', () => {
      console.log('✅ 已连接到服务器，Socket ID:', newSocket.id);
      console.log('📋 白板 ID:', pathBoardId);
      console.log('🔄 发送 join-whiteboard 请求...');

      // 加入指定白板
      newSocket.emit('join-whiteboard', pathBoardId);
    });

    // 如果已经连接，立即加入白板
    if (newSocket.connected) {
      console.log('Socket 已经连接，立即加入白板');
      newSocket.emit('join-whiteboard', pathBoardId);
    }

    setSocket(newSocket);

    newSocket.on('disconnect', () => {
      console.log('与服务器断开连接');
    });

    // 接收白板内容
    newSocket.on('whiteboard-content', (data) => {
      console.log('📨 收到白板内容:', data);
      console.log('📏 内容长度:', data.content?.length || 0);
      console.log('👁️ 内容预览:', data.content?.substring(0, 80) || '(空)');

      const receivedContent = data.content || '';
      console.log('💾 设置内容到状态, 长度:', receivedContent.length);

      setContent(receivedContent);
      setIsLoading(false);
      clearTimeout(loadingTimeout);

      console.log('✅ 白板内容加载完成');
    });

    // 接收内容更新
    newSocket.on('content-updated', (data) => {
      console.log('🔄 收到内容更新:', data);
      console.log('📏 更新后长度:', data.content?.length || 0);
      setContent(data.content || '');
    });

    // 错误处理
    newSocket.on('error', (error) => {
      console.error('Socket 错误:', error);
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    });

    newSocket.on('connect_error', (error) => {
      console.error('连接错误:', error);
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    });

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(loadingTimeout);
      newSocket.close();
    };
  }, []); // 修复：移除 content 依赖，只在组件挂载时运行一次

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (socket) {
      socket.emit('content-update', {
        whiteboardId: boardId,
        content: newContent
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <textarea
      className="document-textarea"
      value={content}
      onChange={handleContentChange}
      placeholder="开始输入..."
      spellCheck={false}
    />
  );
};

export default App;
