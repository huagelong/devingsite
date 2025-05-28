export function isClient() {
  return import.meta.client
}

export function isServer() {
  return import.meta.server
}

export function isDev() {
  return process.env.NODE_ENV === 'development'
}

export const useHelper = {
  isClient,
  isServer,
  isDev,
}
