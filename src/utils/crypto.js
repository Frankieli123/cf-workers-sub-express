const crypto = require('crypto');

// MD5双重加密函数（与原Workers代码保持一致）
const MD5MD5 = async (text) => {
  // 第一次MD5
  const firstHash = crypto.createHash('md5').update(text).digest('hex');
  
  // 取中间20位字符
  const middlePart = firstHash.slice(7, 27);
  
  // 第二次MD5
  const secondHash = crypto.createHash('md5').update(middlePart).digest('hex');
  
  return secondHash.toLowerCase();
};

// Base64编码函数
const encodeBase64 = (data) => {
  try {
    return Buffer.from(data, 'utf8').toString('base64');
  } catch (error) {
    console.error('Base64编码失败:', error);
    return '';
  }
};

// Base64解码函数
const decodeBase64 = (str) => {
  try {
    return Buffer.from(str, 'base64').toString('utf8');
  } catch (error) {
    console.error('Base64解码失败:', error);
    return '';
  }
};

// 验证Base64格式
const isValidBase64 = (str) => {
  // 移除所有空白字符
  const cleanStr = str.replace(/\s/g, '');
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return base64Regex.test(cleanStr);
};

module.exports = {
  MD5MD5,
  encodeBase64,
  decodeBase64,
  isValidBase64
};
