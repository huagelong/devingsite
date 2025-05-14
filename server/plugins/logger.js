export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('log', (log) => {
    // 自定义处理日志
    console.log(`[自定义日志] ${log.level}: ${log.message}`)
    // 可以写入文件或发送到日志服务
  })
})
