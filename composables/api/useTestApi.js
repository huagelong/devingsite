export function useTestApi() {
  const { $http } = useNuxtApp()

  const test = (query, options = {}) => {
    return $http().get('/api/test', query, options)
  }

  const test2 = (query, options = {}) => {
    return useAsyncData('test.test', () => $http().get$('/api/test', query, options))
  }

  return { test, test2 }
}
