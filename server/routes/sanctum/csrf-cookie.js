import { faker } from '@faker-js/faker'

export default defineEventHandler((event) => {
  const uuid = faker.string.uuid()
  setCookie(event, 'XSRF-TOKEN', uuid, {
    maxAge: 60 * 60 * 24 * 7, // Expires in 1 week
    sameSite: 'strict', // Only send cookie on same-site requests
  })
})
