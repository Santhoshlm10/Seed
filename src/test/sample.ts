import { faker } from '@faker-js/faker';
export function createRandomUser() {
    return {
      userId: faker.string.uuid(),
      username: faker.internet.username(), // before version 9.1.0, use userName()
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      registeredAt: faker.word.words({count:{max:10,min:1}}),
      nearByLocation: faker.location.nearbyGPSCoordinate({origin:[10,10]}),
      dateBetween: faker.date.between({from:"2026-02-01",to:"2026-02-04"}),
      };
  }
  
  
const users = faker.helpers.multiple(createRandomUser, {
    count: 5,
});
console.log(users)