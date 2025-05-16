export function useTestApi() {
  const test = (query, options = {}) => {
    const { $http } = useNuxtApp()
    return $http().get('/api/test', query, options)
  }

  const test2 = (query, options = {}) => {
    const { $http } = useNuxtApp()
    return useAsyncData('test.test', () => $http().get('/api/test', query, options))
  }

  return { test, test2 }
}
