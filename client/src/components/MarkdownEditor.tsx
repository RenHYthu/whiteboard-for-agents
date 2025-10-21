import React, { useState } from 'react';
import SplitPane from 'react-split-pane';
import { Eye, Edit3, Maximize2 } from 'lucide-react';

interface TextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ content, onContentChange }) => {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [editorSize, setEditorSize] = useState(50);

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  const toggleViewMode = () => {
    if (viewMode === 'split') {
      setViewMode('edit');
    } else if (viewMode === 'edit') {
      setViewMode('preview');
    } else {
      setViewMode('split');
    }
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'edit':
        return <Eye className="h-4 w-4" />;
      case 'preview':
        return <Edit3 className="h-4 w-4" />;
      default:
        return <Maximize2 className="h-4 w-4" />;
    }
  };

  const getViewModeText = () => {
    switch (viewMode) {
      case 'edit':
        return '预览';
      case 'preview':
        return '编辑';
      default:
        return '分屏';
    }
  };

  // 将文本内容转换为HTML，保持换行
  const formatTextContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 视图模式切换按钮 */}
      <div className="flex items-center justify-center p-2 bg-gray-100 border-b border-gray-200">
        <button
          onClick={toggleViewMode}
          className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
        >
          {getViewModeIcon()}
          <span>{getViewModeText()}</span>
        </button>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1">
        {viewMode === 'split' ? (
          <SplitPane
            split="vertical"
            minSize={200}
            maxSize={800}
            defaultSize={editorSize}
            onChange={(size) => setEditorSize(size)}
            className="h-full"
          >
            {/* 编辑器 */}
            <div className="editor-container">
              <textarea
                className="editor-textarea"
                value={content}
                onChange={handleEditorChange}
                placeholder="在这里输入 Markdown 内容..."
                spellCheck={false}
              />
            </div>
            
            {/* 预览 */}
            <div className="preview-container">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {formatTextContent(content)}
              </div>
            </div>
          </SplitPane>
        ) : viewMode === 'edit' ? (
          <div className="editor-container">
            <textarea
              className="editor-textarea"
              value={content}
              onChange={handleEditorChange}
              placeholder="在这里输入文本内容..."
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="preview-container">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {formatTextContent(content)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditor;
