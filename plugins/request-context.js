export default defineNuxtPlugin((nuxtApp) => {
  // 统一处理服务端和客户端上下文
  const event = useHelper.isServer() ? useRequestEvent() : null
  nuxtApp.provide('requestContext', { event })
})
