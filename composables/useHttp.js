// 创建带上下文的节流函数
function createThrottleWithContext() {
  return function (fn, delay = 500) {
    let timer = null
    return function (...args) {
      if (timer)
        return
      timer = setTimeout(() => {
        fn.apply(this, args)
        timer = null
      }, delay)
    }
  }
}

function handleError(response) {
  const { clearTokens } = useTokenApi()
  // 带上下文的错误显示
  const showError = async (text) => {
    if (useHelper.isClient()) {
      const Arco = await import('@arco-design/web-vue')
      Arco.Message.error(text || '未知错误')
    }
    else {
      console.error('服务端错误:', text)
    }
  }
  // 创建带上下文的节流实例
  const throttle = createThrottleWithContext()

  switch (response?.code) {
    case 1000:
      throttle(() => {
        clearTokens()
        showError('登录状态过期')
      })()
      break
    case 65:
      showError('资源不存在')
      break
    case 50:
      showError('服务器错误')
      break
    case 1002:
      showError('token已过期')
      break
    case 1001:
    case 61:
      showError('无访问权限')
      break
    default:
      showError(response?.message || '未知错误')
  }
}

async function fetch(key, url, options) {
  const { applyOptions } = useTokenApi()
  try {
    options = await applyOptions({ ...options, key })
    let response
    console.log(`is_client:${useHelper.isClient()}`)
    if (useHelper.isClient()) {
      response = await $fetch(url, options)
      if (response?.code !== 0)
        handleError(response)
    }
    else {
      const { data } = await useFetch(url, {
        ...options,
        transform: res => ({ ...res, fetchedAt: new Date() }),
      })
      response = data.value
      if (response?.code !== 0)
        handleError(response)
    }

    return response
  }
  catch (error) {
    console.error('请求异常:', error)
    handleError({ code: 50, message: error.message })
    return null
  }
}

export async function useCustomFetch(key, url, options = {}) {
  const { applyOptions } = useTokenApi()
  options = await applyOptions({ ...options, key })
  if (options.$) {
    const data = ref(null)
    const error = ref(null)
    return await $fetch(url, options).then((res) => {
      data.value = res.data
      return {
        data,
        error,
      }
    })
  }

  return await useFetch(url, {
    ...options,
    // 相当于响应拦截器
    transform: (res) => {
      return res.data
    },
  })
}

export function useHttp() {
  return {
    get: (key, url, params, options) => fetch(key, url, { method: 'GET', params, ...options }),
    post: (key, url, body, options) => fetch(key, url, { method: 'POST', body, ...options }),
    put: (key, url, body, options) => fetch(key, url, { method: 'PUT', body, ...options }),
    delete: (key, url, options) => fetch(key, url, { method: 'DELETE', ...options }),
  }
}
