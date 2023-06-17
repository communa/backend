import faker from 'faker';
import { expect } from 'chai';

import { suite, test } from '@testdeck/mocha';
import { UserRepository } from '../../repository/UserRepository';
import { AbstractDatabaseIntegration } from '../AbstractDatabase.integration';
import { User } from '../../entity/User';
import { EUserRole } from '../../interface/EUserRole';
import { Signer } from '../../service/Signer';

@suite()
export class UserRepositoryIntegrationTest extends AbstractDatabaseIntegration {
  protected userRepository: UserRepository;
  protected signer: Signer;

  constructor() {
    super();

    this.userRepository = this.container.get('UserRepository');
    this.signer = this.container.get('Signer');
  }

  @test()
  async create() {
    const user = new User();

    user.email = this.faker.email();
    user.passwordPlain = faker.internet.password();

    const newUser = await this.userRepository.saveSingle(user);

    expect(newUser).to.have.property('id');
    expect(newUser.email).to.be.equal(user.email);
    expect(newUser).to.have.property('password');
    expect(newUser).to.have.property('createdAt');
    expect(newUser).to.have.property('updatedAt');
  }

  @test()
  async createAndFind() {
    const password = faker.internet.password();
    const user = new User();

    user.email = this.faker.email();
    user.passwordPlain = password;

    const newUser = await this.userRepository.saveSingle(user);
    const foundUser = await this.userRepository.findByEmailPhoneOrFail(user.email);

    expect(newUser.id).to.be.eq(foundUser.id);
    expect(newUser.password).not.to.be.eq(password);
  }

  @test()
  async createAndDeleteAndFind() {
    const user = new User();

    user.email = this.faker.email();
    user.passwordPlain = faker.internet.password();

    const newUser = await this.userRepository.saveSingle(user);
    const removedUser = await this.userRepository.remove(newUser);

    try {
      await this.userRepository.findByEmailPhoneOrFail(user.email);
    } catch (e: any) {
      expect(e.name).to.be.equal('EntityNotFoundError');
    }

    expect(newUser).to.have.property('id');
    expect(removedUser).to.have.property('id');
    expect(newUser.id).to.be.eq(removedUser.id);
  }

  @test()
  async findAndCount() {
    const user = await this.hostFixture.createHost();

    const positiveA = await this.userRepository.findAndCount({
      filter: {
        id: user.id,
      },
      sort: { createdAt: 'ASC' },
      page: 0,
    });
    const positiveB = await this.userRepository.findAndCount({
      filter: {
        id: user.id,
        role: EUserRole.ROLE_BUSINESS,
      },
      sort: { createdAt: 'ASC' },
      page: 0,
    });
    const positiveC = await this.userRepository.findAndCount({
      filter: {},
      query: user.email,
      sort: { createdAt: 'ASC' },
      page: 0,
    });

    expect(positiveA[1]).to.be.eq(1);
    expect(positiveB[1]).to.be.eq(1);
    expect(positiveC[1]).to.be.eq(1);
  }
}
