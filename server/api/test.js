import { faker } from '@faker-js/faker'
export default defineEventHandler(() => {
  const mockData = {
    list: Array.from({ length: 18 }, (_, _i) => ({
      id: faker.string.uuid().slice(0, 6),
      name: faker.person.fullName(),
      title: faker.lorem.words(3),
      createTime: faker.date.past().toISOString(),
      updateTime: faker.date.recent().toISOString(),
      state: faker.datatype.boolean(),
      remark: faker.lorem.sentence(),
    })),
    total: 18,
  }
  const rs = formatMockResult(200, mockData, '')
  return rs
})
