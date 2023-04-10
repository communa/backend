import faker from 'faker';
import {injectable} from 'inversify';

@injectable()
export class Faker {
  public email(): string {
    return `${this.uuid()}${faker.internet.email()}`;
  }

  public phone(): string {
    return faker.phone.phoneNumber('+1234353#######');
  }

  public userStoreName(): string {
    return `${faker.lorem.word(8)}${faker.datatype.number()}${faker.datatype.number()}`;
  }

  public userHostName(): string {
    return `${faker.lorem.word(8)}${faker.datatype.number()}${faker.datatype.number()}`;
  }

  private uuid() {
    return faker.datatype.uuid().replace('-', '');
  }

  public validatedPassword(): string {
    return `${faker.internet.password(10).toLowerCase()}${faker.random
      .alpha({count: 2})
      .toUpperCase()}_!${faker.datatype.number(9)}`;
  }
}
