export default defineNuxtPlugin((nuxtApp) => {
  if (useHelper.isServer()) {
    // 在服务端，将 event 存储到全局状态
    const event = useRequestEvent()
    nuxtApp.provide('requestContext', { event })
  }
  else {
    // 客户端不处理
    nuxtApp.provide('requestContext', { event: null })
  }
})
