import { faker } from "@faker-js/faker";

onmessage = function (event) {
  const { data } = event;
  const {count} = data;
  function createRandomUser() {
    return {
      userId: faker.string.uuid(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      registeredAt: faker.word.words({ count: { max: 10, min: 1 } }),
      nearByLocation: faker.location.nearbyGPSCoordinate({ origin: [10, 10] }),
    };
  }
  const generatedData = faker.helpers.multiple(createRandomUser, {
    count: parseInt(count),
  });
  postMessage(generatedData);
};
