export function useTokenApi(event) {
  async function getConfig() {
    const runtimeConfig = useRuntimeConfig()
    return {
      baseURL: runtimeConfig.public.baseURL,
      appId: runtimeConfig.public.appId,
      appSecret: runtimeConfig.public.appSecret,
      defaultLang: 'zh_CN',
    }
  }

  async function getMyCookie(cookieKey) {
    if (useHelper.isClient()) {
      const token = useCookie(cookieKey)
      return token
    }
    else {
      const serverToken = getCookie(event, cookieKey)
      const token = useCookie(cookieKey)
      token.value = serverToken // 同步到客户端
      return token
    }
  }

  async function getMD5() {
    const CryptoJS = await import('crypto-js')
    return CryptoJS.MD5
  }

  async function generateSignature(appSecret) {
    const xtimestamp = Date.now().toString()
    const xnonce = Math.floor(Math.random() * 999999999 + 99999).toString()
    const md5Func = await getMD5()
    const xsign = md5Func(appSecret + xtimestamp + xnonce).toString()
    return { timestamp: xtimestamp, nonce: xnonce, sign: xsign }
  }

  async function getToken() {
    const tokenCookie = await getMyCookie('token')
    const expireCookie = await getMyCookie('token_expire')

    if (tokenCookie.value && expireCookie.value) {
      const expireTime = Number.parseInt(expireCookie.value)
      if (Date.now() < expireTime - 60000)
        return tokenCookie.value
      return await refreshToken(tokenCookie.value)
    }
    const config = await getConfig()
    const signatureParams = await generateSignature(config.appSecret)
    if (!signatureParams) {
      if (useHelper.isClient()) {
        const Arco = await import('@arco-design/web-vue')
        Arco.Message.error('签名生成失败')
      }
      return null
    }
    const langCookie = await getMyCookie('language')
    const language = langCookie.value || config.defaultLang

    let response
    if (useHelper.isClient()) {
      response = await $fetch('/api/getToken', {
        baseURL: config.baseURL,
        method: 'GET',
        params: {
          app_id: config.appId,
          signature: signatureParams.sign,
          timestamp: signatureParams.timestamp,
          nonce: signatureParams.nonce,
          language,
        },
      })
    }
    else {
      const { data } = await useFetch('/api/getToken', {
        baseURL: config.baseURL,
        method: 'GET',
        params: {
          app_id: config.appId,
          signature: signatureParams.sign,
          timestamp: signatureParams.timestamp,
          nonce: signatureParams.nonce,
          language,
        },
        key: 'server:getToken',
      })
      response = data.value
    }

    if (response?.code === 0 && response.data?.token) {
      tokenCookie.value = response.data.token
      expireCookie.value = (response.data.expire * 1000).toString()
      return response.data.token
    }
    return null
  }

  async function refreshToken(currentToken) {
    // 确保await getMyCookie在正确的上下文中调用
    const tokenCookie = await getMyCookie('token')
    const expireCookie = await getMyCookie('token_expire')
    const langCookie = await getMyCookie('language')
    const config = await getConfig()
    const language = langCookie.value || config.defaultLang

    let response
    if (useHelper.isClient()) {
      response = await $fetch('/api/refreshToken', {
        baseURL: config.baseURL,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept-Language': language,
          'X-App-Id': config.appId,
        },
      })
    }
    else {
      const { data } = await useFetch('/api/refreshToken', {
        baseURL: config.baseURL,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept-Language': language,
          'X-App-Id': config.appId,
        },
        key: 'server:refreshToken',
      })
      response = data.value
    }

    if (response?.code === 0 && response.data?.token) {
      tokenCookie.value = response.data.token
      expireCookie.value = (response.data.expire * 1000).toString()
      return response.data.token
    }
    return currentToken
  }

  const clearTokens = async () => {
    const tokenCookie = await getMyCookie('token')
    const expireCookie = await getMyCookie('token_expire')
    tokenCookie.value = null
    expireCookie.value = null
  }

  async function applyOptions(options = {}) {
    const config = await getConfig()
    options.baseURL = options.baseURL ?? config.baseURL
    options.initialCache = options.initialCache ?? false
    options.headers = options.headers || {}
    options.method = options.method || 'GET'
    options.timeout = 3000

    // 确保await getMyCookie在正确的上下文中调用
    const langCookie = await getMyCookie('language')
    useLogger().info(langCookie)
    const language = langCookie.value || config.defaultLang

    let headers = {
      'accept': 'application/json',
      'Accept-Language': language,
      'X-App-Id': config.appId,
    }

    const tokenCookie = await getMyCookie('token')
    const token = tokenCookie.value
    if (!token) {
      const newToken = await getToken()
      if (newToken)
        headers.Authorization = `Bearer ${newToken}`
    }
    else {
      headers.Authorization = `Bearer ${token}`
    }

    if (useHelper.isServer()) {
      const serverHeaders = useRequestHeaders(['referer', 'cookie'])
      headers = { ...headers, ...serverHeaders }
    }

    options.headers = { ...headers, ...options.headers }
    return options
  }

  return {
    getConfig,
    getMD5,
    generateSignature,
    getToken,
    refreshToken,
    applyOptions,
    clearTokens,
    getMyCookie,
  }
}
