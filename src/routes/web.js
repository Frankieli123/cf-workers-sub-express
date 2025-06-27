const express = require('express');
const { validateToken, generateGuestToken } = require('../utils/auth');
const { getLinks, saveLinks } = require('../utils/storage');
const { sendMessage } = require('../utils/telegram');

const router = express.Router();

// 获取客户端IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// Web管理界面路由
router.get('/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const userAgentHeader = req.headers['user-agent'] || '';
    const clientIP = getClientIP(req);
    
    // 验证token
    const isValidToken = await validateToken(token, req.path);
    
    if (!isValidToken) {
      return res.status(403).send('Access Denied');
    }
    
    // 检查是否为浏览器访问且无查询参数
    if (userAgentHeader.toLowerCase().includes('mozilla') && !req.query.token && Object.keys(req.query).length === 0) {
      // 发送编辑订阅通知
      await sendMessage(
        `#编辑订阅 ${process.env.SUB_NAME || 'CF-Workers-SUB'}`, 
        clientIP, 
        `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${req.hostname}\n<tg-spoiler>入口: ${req.path}</tg-spoiler>`
      );
      
      const guestToken = await generateGuestToken(process.env.TOKEN || 'auto', process.env.GUEST_TOKEN || '');
      return res.send(await generateWebInterface(req, guestToken));
    }
    
    // 其他情况重定向到订阅处理
    return res.redirect(`/?token=${token}`);
    
  } catch (error) {
    console.error('处理Web界面请求时出错:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 处理POST请求（保存订阅内容）
router.post('/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    // 验证token
    const isValidToken = await validateToken(token, req.path);
    
    if (!isValidToken) {
      return res.status(403).send('Access Denied');
    }
    
    const content = req.body;
    const success = await saveLinks(content);
    
    if (success) {
      res.send('保存成功');
    } else {
      res.status(500).send('保存失败');
    }
    
  } catch (error) {
    console.error('保存订阅内容时出错:', error);
    res.status(500).send('保存失败: ' + error.message);
  }
});

// 生成Web管理界面HTML
const generateWebInterface = async (req, guestToken) => {
  const mytoken = process.env.TOKEN || 'auto';
  const FileName = process.env.SUB_NAME || 'CF-Workers-SUB';
  const subConverter = process.env.SUB_API || 'url.v1.mk';
  const subConfig = process.env.SUB_CONFIG || 'https://raw.githubusercontent.com/Frankieli123/clash2/refs/heads/main/Clash-LIAN.ini';
  const subProtocol = subConverter.includes('http://') ? 'http' : 'https';
  const cleanSubConverter = subConverter.replace(/^https?:\/\//, '');
  
  let content = '';
  try {
    content = await getLinks();
  } catch (error) {
    console.error('读取订阅内容失败:', error);
    content = '读取数据时发生错误: ' + error.message;
  }
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${FileName} 订阅编辑</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      padding: 15px;
      box-sizing: border-box;
      font-size: 13px;
    }
    .editor-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    .editor {
      width: 100%;
      height: 300px;
      margin: 15px 0;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.5;
      overflow-y: auto;
      resize: none;
    }
    .save-container {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .save-btn {
      padding: 6px 15px;
      color: white;
      background: #4CAF50;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .save-btn:hover {
      background: #45a049;
    }
    .save-status {
      color: #666;
    }
    .notice-content {
      display: none;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
</head>
<body>
  ################################################################<br>
  Subscribe / sub 订阅地址, 点击链接自动 <strong>复制订阅链接</strong> 并 <strong>生成订阅二维码</strong> <br>
  ---------------------------------------------------------------<br>
  自适应订阅地址:<br>
  <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/${mytoken}?sub','qrcode_0')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/${mytoken}</a><br>
  <div id="qrcode_0" style="margin: 10px 10px 10px 10px;"></div>
  Base64订阅地址:<br>
  <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/${mytoken}?b64','qrcode_1')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/${mytoken}?b64</a><br>
  <div id="qrcode_1" style="margin: 10px 10px 10px 10px;"></div>
  clash订阅地址:<br>
  <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/${mytoken}?clash','qrcode_2')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/${mytoken}?clash</a><br>
  <div id="qrcode_2" style="margin: 10px 10px 10px 10px;"></div>
  singbox订阅地址:<br>
  <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/${mytoken}?sb','qrcode_3')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/${mytoken}?sb</a><br>
  <div id="qrcode_3" style="margin: 10px 10px 10px 10px;"></div>
  surge订阅地址:<br>
  <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/${mytoken}?surge','qrcode_4')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/${mytoken}?surge</a><br>
  <div id="qrcode_4" style="margin: 10px 10px 10px 10px;"></div>
  loon订阅地址:<br>
  <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/${mytoken}?loon','qrcode_5')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/${mytoken}?loon</a><br>
  <div id="qrcode_5" style="margin: 10px 10px 10px 10px;"></div>
  &nbsp;&nbsp;<strong><a href="javascript:void(0);" id="noticeToggle" onclick="toggleNotice()">查看访客订阅∨</a></strong><br>
  <div id="noticeContent" class="notice-content">
    ---------------------------------------------------------------<br>
    访客订阅只能使用订阅功能，无法查看配置页！<br>
    GUEST（访客订阅TOKEN）: <strong>${guestToken}</strong><br>
    ---------------------------------------------------------------<br>
    自适应订阅地址:<br>
    <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/sub?token=${guestToken}','guest_0')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/sub?token=${guestToken}</a><br>
    <div id="guest_0" style="margin: 10px 10px 10px 10px;"></div>
    Base64订阅地址:<br>
    <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/sub?token=${guestToken}&b64','guest_1')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/sub?token=${guestToken}&b64</a><br>
    <div id="guest_1" style="margin: 10px 10px 10px 10px;"></div>
    clash订阅地址:<br>
    <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/sub?token=${guestToken}&clash','guest_2')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/sub?token=${guestToken}&clash</a><br>
    <div id="guest_2" style="margin: 10px 10px 10px 10px;"></div>
    singbox订阅地址:<br>
    <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/sub?token=${guestToken}&sb','guest_3')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/sub?token=${guestToken}&sb</a><br>
    <div id="guest_3" style="margin: 10px 10px 10px 10px;"></div>
    surge订阅地址:<br>
    <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/sub?token=${guestToken}&surge','guest_4')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/sub?token=${guestToken}&surge</a><br>
    <div id="guest_4" style="margin: 10px 10px 10px 10px;"></div>
    loon订阅地址:<br>
    <a href="javascript:void(0)" onclick="copyToClipboard('${baseUrl}/sub?token=${guestToken}&loon','guest_5')" style="color:blue;text-decoration:underline;cursor:pointer;">${baseUrl}/sub?token=${guestToken}&loon</a><br>
    <div id="guest_5" style="margin: 10px 10px 10px 10px;"></div>
  </div>
  ---------------------------------------------------------------<br>
  ################################################################<br>
  订阅转换配置<br>
  ---------------------------------------------------------------<br>
  SUBAPI（订阅转换后端）: <strong>${subProtocol}://${cleanSubConverter}</strong><br>
  SUBCONFIG（订阅转换配置文件）: <strong>${subConfig}</strong><br>
  ---------------------------------------------------------------<br>
  ################################################################<br>
  ${FileName} 汇聚订阅编辑: 
  <div class="editor-container">
    <textarea class="editor" 
      placeholder="LINK示例（一行一个代理节点或订阅链接）：
vless://246aa795-0637-4f4c-8f64-2c8fb24c1bad@127.0.0.1:1234?encryption=none&security=tls&sni=TG.CMLiussss.loseyourip.com&allowInsecure=1&type=ws&host=TG.CMLiussss.loseyourip.com&path=%2F%3Fed%3D2560#CFnat
trojan://aa6ddd2f-d1cf-4a52-ba1b-2640c41a7856@218.190.230.207:41288?security=tls&sni=hk12.bilibili.com&allowInsecure=1&type=tcp&headerType=none#HK
ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNToyRXRQcVo2SFlqVU5jSG9oTGZVcEZRd25makNDUTVtaDFtSmRFTUNCdWN1V1o5UDF1ZGtSS0huVnh1bzU1azFLWHoyRm82anJndDE4VzY2b3B0eUFlNGJtMWp6ZkNmQmI%3D@84.19.31.63:50841#DE


订阅链接示例（一行一个订阅链接）：
https://sub.xf.free.hr/auto"
      id="content">${content}</textarea>
    <div class="save-container">
      <button class="save-btn" onclick="saveContent(this)">保存</button>
      <span class="save-status" id="saveStatus"></span>
    </div>
  </div>
  <br>
  ################################################################<br>
  telegram 交流群 技术大佬 | 在线发牌!<br>
  <a href='https://t.me/CMLiussss'>https://t.me/CMLiussss</a><br>
  ---------------------------------------------------------------<br>
  github 项目地址 Star!Star!Star!!!<br>
  <a href='https://github.com/cmliu/CF-Workers-SUB'>https://github.com/cmliu/CF-Workers-SUB</a><br>
  ---------------------------------------------------------------<br>
  ################################################################<br>
  <br><br>UA: <strong>${req.headers['user-agent'] || ''}</strong>
  
  <script>
    function copyToClipboard(text, qrcode) {
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板');
      }).catch(err => {
        console.error('复制失败:', err);
      });
      const qrcodeDiv = document.getElementById(qrcode);
      qrcodeDiv.innerHTML = '';
      new QRCode(qrcodeDiv, {
        text: text,
        width: 220,
        height: 220,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.Q,
        scale: 1
      });
    }
    
    function saveContent(button) {
      try {
        const textarea = document.getElementById('content');
        const content = textarea.value || '';
        
        button.textContent = '保存中...';
        button.disabled = true;
        
        fetch(window.location.href, {
          method: 'POST',
          body: content,
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8'
          }
        })
        .then(response => response.text())
        .then(result => {
          const now = new Date().toLocaleString();
          document.title = \`编辑已保存 \${now}\`;
          document.getElementById('saveStatus').textContent = \`已保存 \${now}\`;
        })
        .catch(error => {
          console.error('保存失败:', error);
          document.getElementById('saveStatus').textContent = '保存失败: ' + error.message;
        })
        .finally(() => {
          button.textContent = '保存';
          button.disabled = false;
        });
      } catch (error) {
        console.error('保存过程出错:', error);
        button.textContent = '保存';
        button.disabled = false;
        document.getElementById('saveStatus').textContent = '错误: ' + error.message;
      }
    }
    
    function toggleNotice() {
      const noticeContent = document.getElementById('noticeContent');
      const noticeToggle = document.getElementById('noticeToggle');
      if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
        noticeContent.style.display = 'block';
        noticeToggle.textContent = '隐藏访客订阅∧';
      } else {
        noticeContent.style.display = 'none';
        noticeToggle.textContent = '查看访客订阅∨';
      }
    }
  </script>
</body>
</html>
`;
};

module.exports = router;
