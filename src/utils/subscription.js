const fetch = require('node-fetch');
const { decodeBase64, isValidBase64, encodeBase64 } = require('./crypto');

// 解析添加的链接
const parseLinks = (envadd) => {
  const addtext = envadd.replace(/[\t"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');
  let cleanText = addtext;
  
  if (cleanText.charAt(0) === '\n') cleanText = cleanText.slice(1);
  if (cleanText.charAt(cleanText.length - 1) === '\n') cleanText = cleanText.slice(0, cleanText.length - 1);
  
  return cleanText.split('\n').filter(line => line.trim());
};

// 获取订阅内容
const getSUB = async (apiUrls, userAgentHeader, 追加UA = 'v2rayn') => {
  if (!apiUrls || apiUrls.length === 0) {
    return [[], ""];
  }
  
  // 去重
  const uniqueUrls = [...new Set(apiUrls)];
  let newapi = "";
  let 订阅转换URLs = "";
  let 异常订阅 = "";
  
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 2000);
  
  try {
    const responses = await Promise.allSettled(
      uniqueUrls.map(apiUrl => 
        getUrl(apiUrl, 追加UA, userAgentHeader, controller.signal)
          .then(response => response.ok ? response.text() : Promise.reject(response))
      )
    );
    
    const modifiedResponses = responses.map((response, index) => {
      if (response.status === 'rejected') {
        const reason = response.reason;
        if (reason && reason.name === 'AbortError') {
          return {
            status: '超时',
            value: null,
            apiUrl: uniqueUrls[index]
          };
        }
        console.error(`请求失败: ${uniqueUrls[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
        return {
          status: '请求失败',
          value: null,
          apiUrl: uniqueUrls[index]
        };
      }
      return {
        status: response.status,
        value: response.value,
        apiUrl: uniqueUrls[index]
      };
    });
    
    console.log('订阅获取结果:', modifiedResponses);
    
    for (const response of modifiedResponses) {
      if (response.status === 'fulfilled') {
        const content = response.value || 'null';
        
        if (content.includes('proxies:')) {
          // Clash 配置
          订阅转换URLs += "|" + response.apiUrl;
        } else if (content.includes('outbounds"') && content.includes('inbounds"')) {
          // Singbox 配置
          订阅转换URLs += "|" + response.apiUrl;
        } else if (content.includes('://')) {
          // 明文订阅
          newapi += content + '\n';
        } else if (isValidBase64(content)) {
          // Base64订阅
          newapi += decodeBase64(content) + '\n';
        } else {
          // 异常订阅
          const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
          console.log('异常订阅:', 异常订阅LINK);
          异常订阅 += `${异常订阅LINK}\n`;
        }
      }
    }
  } catch (error) {
    console.error('获取订阅时出错:', error);
  } finally {
    clearTimeout(timeout);
  }
  
  const 订阅内容 = parseLinks(newapi + 异常订阅);
  return [订阅内容, 订阅转换URLs];
};

// 发送HTTP请求获取URL内容
const getUrl = async (targetUrl, 追加UA, userAgentHeader, signal) => {
  const userAgent = `${Buffer.from('djJyYXlOLzYuNDU=', 'base64').toString()} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`;
  
  console.log(`请求URL: ${targetUrl}`);
  console.log(`User-Agent: ${userAgent}`);
  
  return fetch(targetUrl, {
    method: 'GET',
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    signal,
    timeout: 10000
  });
};

// Clash配置修复
const clashFix = (content) => {
  if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
    let lines;
    if (content.includes('\r\n')) {
      lines = content.split('\r\n');
    } else {
      lines = content.split('\n');
    }

    let result = "";
    for (let line of lines) {
      if (line.includes('type: wireguard')) {
        const 备改内容 = `, mtu: 1280, udp: true`;
        const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
        result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
      } else {
        result += line + '\n';
      }
    }

    content = result;
  }
  return content;
};

// 生成订阅转换URL
const generateSubConverterUrl = (订阅格式, 订阅转换URL, subConverter, subProtocol, subConfig) => {
  const baseUrl = `${subProtocol}://${subConverter}/sub`;
  const encodedUrl = encodeURIComponent(订阅转换URL);
  const encodedConfig = encodeURIComponent(subConfig);
  const commonParams = `url=${encodedUrl}&insert=false&config=${encodedConfig}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;

  switch (订阅格式) {
    case 'clash':
      return `${baseUrl}?target=clash&${commonParams}&new_name=true`;
    case 'singbox':
      return `${baseUrl}?target=singbox&${commonParams}&new_name=true`;
    case 'surge':
      return `${baseUrl}?target=surge&ver=4&${commonParams}&new_name=true`;
    case 'quanx':
      return `${baseUrl}?target=quanx&${commonParams}&udp=true`;
    case 'loon':
      return `${baseUrl}?target=loon&${commonParams}`;
    default:
      return null;
  }
};

module.exports = {
  parseLinks,
  getSUB,
  getUrl,
  clashFix,
  generateSubConverterUrl
};
