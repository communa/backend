import faker from 'faker';
import { expect } from 'chai';
import * as web3 from 'web3';
import { suite, test } from '@testdeck/mocha';

import { UserRepository } from '../../repository/UserRepository';
import { EUserRole } from '../../interface/EUserRole';
import { BaseControllerTest } from './BaseController.test';
import { UserFixture } from '../fixture/UserFixture';
import { Faker } from '../../service/Faker';
import { Authenticator } from '../../service/Authenticator';

@suite()
export class AuthControllerTest extends BaseControllerTest {
  protected userRepository: UserRepository;
  protected authenticator: Authenticator;
  protected userFixture: UserFixture;
  protected faker: Faker;

  constructor() {
    super();

    this.authenticator = this.container.get('Authenticator');
    this.userRepository = this.container.get('UserRepository');
    this.userFixture = this.container.get('UserFixture');
    this.faker = this.container.get('Faker');
  }

  @test()
  async loginWeb3() {
    const account = web3.eth.accounts.create();
    const nonce = await this.authenticator.getNonce(account.address);
    const signature = web3.eth.accounts.sign(nonce, account.privateKey)

    const res = await this.http.request({
      url: `${this.url}/api/auth/web3`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        signature: signature.signature,
        address: account.address,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});
  }

  @test()
  async nonce() {
    const account = web3.eth.accounts.create();

    const res = await this.http.request({
      url: `${this.url}/api/auth/nonce`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        address: account.address,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.length).to.be.eq(36);
  }

  @test()
  async status_user() {
    const user = await this.userFixture.createUser();
    const token = this.authenticator.generateJwtToken(user);

    const config = {
      url: `${this.url}/api/auth/status`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const res = await this.http.request(config);

    expect(res.data).to.have.property('id');
    expect(res.data).not.to.have.property('password');
    expect(res.data).not.to.have.property('resetPasswordJwtIat');

    expect(res.data.email).to.be.equal(user.email);
    expect(res.data.id).to.be.equal(user.id);
  }

  @test()
  async status_invalidDoNotThrowException() {
    const token = faker.datatype.uuid();

    const config = {
      url: `${this.url}/api/auth/status`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const res = await this.http.request(config);

    expect(res.data).to.be.equal('');
  }

  @test()
  async register_userEmail() {
    const account = web3.eth.accounts.create();

    const config = {
      url: `${this.url}/api/auth/register`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        address: account.address,
        emailOrPhone: faker.internet.email(),
        passwordPlain: this.userFixture.validatedPassword(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      },
    };

    const res = await this.http.request(config);

    const user = await this.userRepository.findByEmailPhoneOrFail(config.data.emailOrPhone);

    expect(user.phone).to.be.null;
    expect(user.email).to.be.equal(config.data.emailOrPhone);
    expect(user.roles).to.be.deep.equal([EUserRole.ROLE_USER]);
    expect(user.roles).to.be.deep.eq(['ROLE_USER']);

    expect(res.headers.location).to.be.eq('/api/auth/status');
    expect(res.headers.authorization).not.to.be.empty;
    expect(res.status).to.be.equal(201);
    expect(res.data).to.be.empty;
  }

  @test()
  async register_validationFails() {
    const config = {
      url: `${this.url}/api/auth/register`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    let err = null;

    try {
      await this.http.request(config);
    } catch (e: any) {
      err = e;
    }

    expect(err.response.status).to.be.equal(400);
    expect(err.response.data.name).to.be.equal('BadRequestError');
    expect(err.response.data.errors[0].constraints.EmailOrPhoneConstraint).to.be.equal(
      'emailOrPhone should not be empty'
    );
    expect(err.response.data.errors[1].constraints.isLength).to.be.equal(
      'Password must be longer than or equal to 8 characters'
    );
  }

  @test()
  async register_duplicateEmailException() {
    const email = faker.internet.email();
    await this.userFixture.createWithEmailAndPassword(email, this.userFixture.validatedPassword());

    const data = {
      emailOrPhone: email,
      passwordPlain: this.userFixture.validatedPassword(),
    };
    const config = {
      url: `${this.url}/api/auth/register`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    };
    let err = null;

    try {
      await this.http.request(config);
    } catch (e: any) {
      err = e;
    }

    expect(err.response.status).to.be.equal(400);
    expect(err.response.data.name).to.be.equal('BadRequestError');
    expect(err.response.data.errors[0].constraints.EmailOrPhoneConstraint).to.be.equal(
      'Email address is already taken'
    );
  }

  @test()
  async register_duplicatePhoneException() {
    const phone = this.faker.phone();
    await this.userFixture.createWithPhoneAndPassword(phone, this.userFixture.validatedPassword());

    const config = {
      url: `${this.url}/api/auth/register`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: phone,
        passwordPlain: this.userFixture.validatedPassword(),
      },
    };
    let err = null;

    try {
      await this.http.request(config);
    } catch (e: any) {
      err = e;
    }

    expect(err.response.status).to.be.equal(400);
    expect(err.response.data.name).to.be.equal('BadRequestError');
    expect(err.response.data.errors[0].constraints.EmailOrPhoneConstraint).to.be.equal(
      'Phone is already taken'
    );
  }

  @test()
  async login_failsEmail() {
    const config = {
      url: `${this.url}/api/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: faker.internet.email(),
        passwordPlain: faker.internet.password(),
      },
    };

    try {
      await this.http.request(config);
    } catch (e: any) {
      expect(e.response.status).to.be.equal(401);
      expect(e.response.data.message).to.be.equal(
        'Authentication error: username or password is incorrect'
      );
    }
  }

  @test()
  async login_failsPassword() {
    const user = await this.userFixture.createUser();

    const config = {
      url: `${this.url}/api/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: user.email,
        password: faker.internet.password(),
      },
    };

    let err = null;

    try {
      await this.http.request(config);
    } catch (e: any) {
      err = e;
    }

    expect(err.response.status).to.be.equal(401);
    expect(err.response.data.message).to.be.equal(
      'Authentication error: username or password is incorrect'
    );
  }

  @test()
  async login_emailSuccess() {
    const password = faker.internet.password();
    const user = await this.userFixture.createWithEmailAndPassword(
      faker.internet.email(),
      password
    );

    const config = {
      url: `${this.url}/api/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: user.email,
        password,
      },
    };

    const res = await this.http.request(config);
    const token = res.headers.authorization;
    const refreshToken = res.headers['refresh-token'];

    const userFromToken = await this.authenticator.getUserFromJwtToken(token);
    const tokens = this.authenticator.getTokens(user);

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.empty;
    expect(token).to.be.equal(tokens.accessToken);
    expect(refreshToken).to.be.equal(tokens.refreshToken);
    expect(userFromToken.tz).to.be.equal('UTC');
  }

  @test()
  async login_phoneSuccess() {
    const password = faker.internet.password();
    const user = await this.userFixture.createWithPhoneAndPassword(
      faker.phone.phoneNumber(),
      password
    );

    const config = {
      url: `${this.url}/api/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: user.phone,
        password,
      },
    };

    const res = await this.http.request(config);
    const token = res.headers.authorization;
    const refreshToken = res.headers['refresh-token'];

    const userFromToken = await this.authenticator.getUserFromJwtToken(token);
    const tokens = this.authenticator.getTokens(user);

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.empty;
    expect(token).to.be.equal(tokens.accessToken);
    expect(refreshToken).to.be.equal(tokens.refreshToken);
    expect(userFromToken.tz).to.be.equal('UTC');
  }

  @test()
  async refreshToken_success() {
    const password = this.userFixture.validatedPassword();
    const user = await this.userFixture.createWithEmailAndPassword(
      faker.internet.email(),
      password
    );

    const loginRes = await this.http.request({
      url: `${this.url}/api/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: user.email,
        password,
      },
    });

    const refreshTokenAfterLogin = loginRes.headers['refresh-token'];

    const refreshRes = await this.http.request({
      url: `${this.url}/api/auth/refresh`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        refreshToken: refreshTokenAfterLogin,
      },
    });

    const token = refreshRes.headers.authorization;
    const refreshToken = refreshRes.headers['refresh-token'];

    const userFromToken = await this.authenticator.getUserFromJwtToken(token);
    const tokens = this.authenticator.getTokens(user);

    expect(loginRes.status).to.be.equal(200);
    expect(loginRes.data).to.be.empty;
    expect(token).to.be.equal(tokens.accessToken);
    expect(refreshToken).to.be.eq(tokens.refreshToken);
    expect(userFromToken.id).to.be.equal(user.id);
  }

  @test()
  async forgotPassword_emailUser() {
    const user = await this.userFixture.createUser();

    const config = {
      url: `${this.url}/api/auth/forgot-password`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: user.email,
      },
    };

    const res = await this.http.request(config);

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.empty;
  }

  @test()
  async forgotPassword_emailHost() {
    const user = await this.userFixture.createUser();

    const config = {
      url: `${this.url}/api/auth/forgot-password`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: user.email,
      },
    };

    const res = await this.http.request(config);

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.empty;
  }

  @test()
  async forgotPassword_throwsWrongCredentialsException() {
    const config = {
      url: `${this.url}/api/auth/forgot-password`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: faker.internet.email(),
      },
    };
    let error = null;

    try {
      await this.http.request(config);
    } catch (e: any) {
      error = e;
    }

    expect(error.response.status).to.be.eq(401);
    expect(error.response.data.name).to.be.eq('AuthenticationException');
    expect(error.response.data.message).to.be.eq(
      'Authentication error: e-mail address or phone number is missing in the system'
    );
  }

  @test()
  async forgotPassword_phoneNumberAsNumberException() {
    const config = {
      url: `${this.url}/api/auth/forgot-password`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        emailOrPhone: 111111111111,
      },
    };

    try {
      await this.http.request(config);
    } catch (error: any) {
      expect(error.response.status).to.be.eq(400);
      expect(error.response.data.name).to.be.equal('BadRequestError');
      expect(error.response.data.errors[0].constraints).to.be.deep.eq({
        isString: 'emailOrPhone must be a string',
      });
    }
  }
}
