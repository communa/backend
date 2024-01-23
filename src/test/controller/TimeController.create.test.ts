import {expect} from 'chai';
import faker from 'faker';
import {suite, test} from '@testdeck/mocha';
import moment from 'moment';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {TimeRepository} from '../../repository/TimeRepository';
import {TimeCreateManyDto} from '../../validator/dto/TimeCreateManyDto';

@suite
export class TimeControllerTest extends BaseControllerTest {
  protected timeRepository: TimeRepository;
  protected activityManager: ActivityManager;

  constructor() {
    super();

    this.timeRepository = this.container.get('TimeRepository');
    this.activityManager = this.container.get('ActivityManager');
  }

  @test
  async createPersonalMany() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const activityB = await this.activityFixture.createPersonal(user);
    const data: TimeCreateManyDto[] = [
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').unix(),
        toAt: moment.utc().unix(),
        activityId: activityA.id,
      },
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').unix(),
        toAt: moment.utc().unix(),
        activityId: activityB.id,
      },
    ];

    const res = await this.http.request({
      url: `${this.url}/api/time/activity`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data,
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal([]);
  }

  @test
  async createPersonalManyWithErrors() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const data: TimeCreateManyDto[] = [
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').unix(),
        toAt: moment.utc().unix(),
        activityId: activityA.id,
      },
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').unix(),
        toAt: moment.utc().unix(),
        activityId: '',
      },
    ];

    const res = await this.http.request({
      url: `${this.url}/api/time/activity`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data,
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal([
      {
        index: 1,
        name: 'QueryFailedError',
        message: 'invalid input syntax for type uuid: ""',
      },
    ]);
  }

  @test
  async createPersonalInputValidationError() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const data = [
      {
        note: faker.datatype.uuid(),
        activity: {
          id: activityA.id,
        },
      },
    ];

    const res = await this.http.request({
      url: `${this.url}/api/time/activity`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data,
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal([
      {
        index: 0,
        name: 'RejectedExecutionException',
        message: 'The given activity is unavailable for time tracking',
      },
    ]);
  }
}
