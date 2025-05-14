export function useTestApi() {
  const test = (query) => {
    return useHttp().get('test.test', '/api/test', query)
  }
  return { test }
}
