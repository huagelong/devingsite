export function useTestApi() {
  const test = (query) => {
    const { $http } = useNuxtApp()
    return $http().get('test.test', '/api/test', query)
  }
  return { test }
}
