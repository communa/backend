import {expect} from 'chai';
import faker from 'faker';
import {suite, test} from '@testdeck/mocha';
import moment from 'moment';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {ITime} from '../../interface/ITime';
import {TimeRepository} from '../../repository/TimeRepository';

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
  async createPersonal() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.createPersonal(user);
    const data: ITime = {
      note: faker.datatype.uuid(),
      keyboardKeys: faker.datatype.number(9),
      mouseKeys: faker.datatype.number(9),
      mouseDistance: faker.datatype.number(9),
      fromAt: moment.utc().subtract(10, 'minutes').toDate(),
      toAt: moment.utc().toDate(),
    };

    const res = await this.http.request({
      url: `${this.url}/api/time/activity/${activity.id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data,
    });

    const id = res.headers.location.split('/')[3];
    const time = await this.timeRepository.findOneByIdOrFail(id);

    expect(res.status).to.be.equal(201);
    expect(time.note).to.be.eq(data.note);
    expect(time.activity.id).to.be.eq(activity.id);
    expect(time.activity.user.id).to.be.eq(user.id);
  }

  @test
  async createPersonalMany() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const activityB = await this.activityFixture.createPersonal(user);
    const data: ITime[] = [
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').toDate(),
        toAt: moment.utc().toDate(),
        activity: {
          id: activityA.id,
        },
      },
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').toDate(),
        toAt: moment.utc().toDate(),
        activity: {
          id: activityB.id,
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
    expect(res.data).to.be.deep.equal([]);
  }

  @test
  async createPersonalManyWithErrors() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const data: ITime[] = [
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').toDate(),
        toAt: moment.utc().toDate(),
        activity: {
          id: activityA.id,
        },
      },
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').toDate(),
        toAt: moment.utc().toDate(),
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
        name: 'TypeError',
        message: "Cannot read properties of undefined (reading 'id')",
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
        message:
          'null value in column "keyboardKeys" of relation "time" violates not-null constraint',
        name: 'QueryFailedError',
      },
    ]);
  }
}
