const express = require('express');
const { validateToken, parseUserAgent, generateFakeToken, generateGuestToken } = require('../utils/auth');
const { getLinks } = require('../utils/storage');
const { parseLinks, getSUB, clashFix, generateSubConverterUrl } = require('../utils/subscription');
const { encodeBase64 } = require('../utils/crypto');
const { sendMessage, isTelegramEnabled } = require('../utils/telegram');
const fetch = require('node-fetch');

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

// 健康检查路由（无需token验证）
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 主订阅路由
router.get('/', async (req, res) => {
  try {
    const userAgentHeader = req.headers['user-agent'] || '';
    const { userAgent, 订阅格式 } = parseUserAgent(userAgentHeader);
    const token = req.query.token;
    const clientIP = getClientIP(req);
    
    // 验证token
    const isValidToken = await validateToken(token, req.path);
    
    if (!isValidToken) {
      // 异常访问处理
      if (isTelegramEnabled() && req.path !== "/" && req.path !== "/favicon.ico") {
        await sendMessage(
          `#异常访问 ${process.env.SUB_NAME || 'CF-Workers-SUB'}`, 
          clientIP, 
          `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${req.hostname}\n<tg-spoiler>入口: ${req.path}${req.url.includes('?') ? req.url.split('?')[1] : ''}</tg-spoiler>`
        );
      }
      
      // 返回nginx欢迎页面
      return res.send(await generateNginxPage());
    }
    
    // 发送获取订阅通知
    await sendMessage(
      `#获取订阅 ${process.env.SUB_NAME || 'CF-Workers-SUB'}`, 
      clientIP, 
      `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${req.hostname}\n<tg-spoiler>入口: ${req.path}${req.url.includes('?') ? req.url.split('?')[1] : ''}</tg-spoiler>`
    );
    
    // 处理订阅逻辑
    return await handleSubscription(req, res, 订阅格式, userAgentHeader);
    
  } catch (error) {
    console.error('处理订阅请求时出错:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 处理订阅逻辑
const handleSubscription = async (req, res, 订阅格式, userAgentHeader) => {
  try {
    // 获取配置
    const SUBUpdateTime = parseInt(process.env.SUB_UPDATE_TIME || '6');
    const subConverter = process.env.SUB_API || 'url.v1.mk';
    const subConfig = process.env.SUB_CONFIG || 'https://raw.githubusercontent.com/Frankieli123/clash2/refs/heads/main/Clash-LIAN.ini';
    const subProtocol = subConverter.includes('http://') ? 'http' : 'https';
    const cleanSubConverter = subConverter.replace(/^https?:\/\//, '');
    
    // 获取主数据
    let MainData = await getLinks();
    const 重新汇总所有链接 = parseLinks(MainData);
    
    let 自建节点 = "";
    let 订阅链接 = "";
    
    // 分离自建节点和订阅链接
    for (let x of 重新汇总所有链接) {
      if (x.toLowerCase().startsWith('http')) {
        订阅链接 += x + '\n';
      } else {
        自建节点 += x + '\n';
      }
    }
    
    MainData = 自建节点;
    const urls = parseLinks(订阅链接);
    
    // 检查URL参数覆盖格式
    if (req.query.b64 || req.query.base64) 订阅格式 = 'base64';
    else if (req.query.clash) 订阅格式 = 'clash';
    else if (req.query.singbox || req.query.sb) 订阅格式 = 'singbox';
    else if (req.query.surge) 订阅格式 = 'surge';
    else if (req.query.quanx) 订阅格式 = 'quanx';
    else if (req.query.loon) 订阅格式 = 'loon';
    
    // 生成订阅转换URL
    const mytoken = process.env.TOKEN || 'auto';
    const fakeToken = await generateFakeToken(mytoken);
    let 订阅转换URL = `${req.protocol}://${req.hostname}${req.hostname.includes(':') ? '' : (req.protocol === 'https' ? '' : ':' + (process.env.PORT || 3000))}/${fakeToken}?token=${fakeToken}`;
    
    let req_data = MainData;
    
    // 获取订阅内容
    if (urls.length > 0) {
      const 追加UA = getUAFromQuery(req.query);
      const 请求订阅响应内容 = await getSUB(urls, userAgentHeader, 追加UA);
      console.log('订阅响应内容:', 请求订阅响应内容);
      req_data += 请求订阅响应内容[0].join('\n');
      订阅转换URL += "|" + 请求订阅响应内容[1];
    }
    
    // 处理WARP节点
    if (process.env.WARP) {
      订阅转换URL += "|" + parseLinks(process.env.WARP).join("|");
    }
    
    // 去重处理
    const uniqueLines = new Set(req_data.split('\n'));
    const result = [...uniqueLines].join('\n');
    
    // Base64编码
    const base64Data = encodeBase64(result);
    
    // 根据格式返回内容
    if (订阅格式 === 'base64' || req.query.token === fakeToken) {
      return res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Profile-Update-Interval': SUBUpdateTime.toString(),
      }).send(base64Data);
    }
    
    // 使用订阅转换
    const subConverterUrl = generateSubConverterUrl(订阅格式, 订阅转换URL, cleanSubConverter, subProtocol, subConfig);
    
    if (!subConverterUrl) {
      return res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Profile-Update-Interval': SUBUpdateTime.toString(),
      }).send(base64Data);
    }
    
    try {
      const subConverterResponse = await fetch(subConverterUrl, { timeout: 10000 });
      
      if (!subConverterResponse.ok) {
        throw new Error(`订阅转换失败: ${subConverterResponse.status}`);
      }
      
      let subConverterContent = await subConverterResponse.text();
      
      if (订阅格式 === 'clash') {
        subConverterContent = clashFix(subConverterContent);
      }
      
      return res.set({
        'Content-Disposition': `attachment; filename*=utf-8''${encodeURIComponent(process.env.SUB_NAME || 'CF-Workers-SUB')}`,
        'Content-Type': 'text/plain; charset=utf-8',
        'Profile-Update-Interval': SUBUpdateTime.toString(),
        'Profile-web-page-url': req.url.includes('?') ? req.url.split('?')[0] : req.url,
      }).send(subConverterContent);
      
    } catch (error) {
      console.error('订阅转换失败:', error);
      return res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Profile-Update-Interval': SUBUpdateTime.toString(),
        'Profile-web-page-url': req.url.includes('?') ? req.url.split('?')[0] : req.url,
      }).send(base64Data);
    }
    
  } catch (error) {
    console.error('处理订阅时出错:', error);
    res.status(500).json({ error: 'Subscription processing failed' });
  }
};

// 从查询参数获取UA
const getUAFromQuery = (query) => {
  if (query.clash) return 'clash';
  if (query.singbox || query.sb) return 'singbox';
  if (query.surge) return 'surge';
  if (query.quanx) return 'Quantumult%20X';
  if (query.loon) return 'Loon';
  return 'v2rayn';
};

// 生成nginx欢迎页面
const generateNginxPage = async () => {
  return `
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
  body {
    width: 35em;
    margin: 0 auto;
    font-family: Tahoma, Verdana, Arial, sans-serif;
  }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
`;
};

module.exports = router;
