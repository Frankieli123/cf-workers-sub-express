const { MD5MD5 } = require('./crypto');

// 获取配置的token
const getTokens = () => {
  const mytoken = process.env.TOKEN || 'auto';
  const guestToken = process.env.GUEST_TOKEN || process.env.GUEST || '';
  
  return { mytoken, guestToken };
};

// 生成假token（基于日期）
const generateFakeToken = async (mytoken) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const timeTemp = Math.ceil(currentDate.getTime() / 1000);
  return await MD5MD5(`${mytoken}${timeTemp}`);
};

// 生成访客token
const generateGuestToken = async (mytoken, customGuestToken = '') => {
  if (customGuestToken) {
    return customGuestToken;
  }
  return await MD5MD5(mytoken);
};

// 验证token是否有效
const validateToken = async (token, pathname) => {
  const { mytoken, guestToken } = getTokens();
  const fakeToken = await generateFakeToken(mytoken);
  const 访客订阅 = await generateGuestToken(mytoken, guestToken);
  
  // 检查各种有效的token格式
  const validTokens = [mytoken, fakeToken, 访客订阅];
  const validPaths = [
    `/${mytoken}`,
    `/${mytoken}?`,
  ];
  
  // 检查token参数
  if (validTokens.includes(token)) {
    return true;
  }
  
  // 检查路径
  if (validPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return true;
  }
  
  return false;
};

// 获取用户代理信息
const parseUserAgent = (userAgentHeader) => {
  const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
  
  let 订阅格式 = 'base64';
  
  if (userAgent.includes('null') || 
      userAgent.includes('subconverter') || 
      userAgent.includes('nekobox') || 
      userAgent.includes('cf-workers-sub')) {
    订阅格式 = 'base64';
  } else if (userAgent.includes('clash')) {
    订阅格式 = 'clash';
  } else if (userAgent.includes('sing-box') || userAgent.includes('singbox')) {
    订阅格式 = 'singbox';
  } else if (userAgent.includes('surge')) {
    订阅格式 = 'surge';
  } else if (userAgent.includes('quantumult%20x')) {
    订阅格式 = 'quanx';
  } else if (userAgent.includes('loon')) {
    订阅格式 = 'loon';
  }
  
  return { userAgent, 订阅格式 };
};

module.exports = {
  getTokens,
  generateFakeToken,
  generateGuestToken,
  validateToken,
  parseUserAgent
};
