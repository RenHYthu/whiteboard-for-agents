javascript:(function(){
  // 获取当前 ChatGPT 页面的内容
  const chatContent = document.querySelector('[data-message-author-role="assistant"]:last-child')?.textContent || 
                     document.querySelector('.markdown')?.textContent || 
                     document.querySelector('[role="presentation"]')?.textContent;
  
  if (!chatContent) {
    alert('请先让 ChatGPT 生成内容');
    return;
  }
  
  // 打开您的白板网站
  const whiteboardUrl = 'https://fat-dodo-81.loca.lt';
  const newWindow = window.open(whiteboardUrl, '_blank');
  
  // 等待页面加载后写入内容
  setTimeout(() => {
    newWindow.postMessage({
      type: 'WRITE_CONTENT',
      content: chatContent
    }, '*');
  }, 2000);
  
  alert('内容已发送到白板！');
})();
