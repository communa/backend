import {expect} from 'chai';
import faker from 'faker';
import {suite, test} from '@testdeck/mocha';
import moment from 'moment';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {TimeRepository} from '../../repository/TimeRepository';
import {TimeCreateDto} from '../../validator/dto/TimeCreateDto';

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
    const data: TimeCreateDto[] = [
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').unix(),
        toAt: moment.utc().unix(),
        activityId: activityA.id,
      },
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
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

    const timeA = await this.timeRepository.findOneByOrFail({
      where: {
        activity: activityA,
      },
    });

    const fromAtA = moment(timeA.fromAt).unix();

    expect(fromAtA).to.be.equal(data[0].fromAt);
    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal([]);
  }

  @test
  async createPersonalInputValidationErrorA() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const data: TimeCreateDto[] = [
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').unix(),
        toAt: moment.utc().unix(),
        activityId: activityA.id,
      },
      {
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
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
        activityId: '',
        fromAt: data[0].fromAt,
        toAt: data[0].toAt,
        name: 'QueryFailedError',
        message: 'invalid input syntax for type uuid: ""',
      },
    ]);
  }

  @test
  async createPersonalInputValidationErrorB() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const data = [
      {
        fromAt: moment.utc().subtract(10, 'minutes').unix(),
        toAt: moment.utc().unix(),
        note: faker.datatype.uuid(),
        activityId: activityA.id,
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
        activityId: activityA.id,
        fromAt: data[0].fromAt,
        toAt: data[0].toAt,
        name: 'QueryFailedError',
        message:
          'null value in column "keyboardKeys" of relation "time" violates not-null constraint',
      },
    ]);
  }

  @test
  async createPersonalDuplicationError() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const fromAt = 1705829280;
    const toAt = moment.unix(fromAt).add(10, 'minutes').unix();
    const timeData = {
      note: faker.datatype.uuid(),
      keyboardKeys: faker.datatype.number(9),
      minutesActive: faker.datatype.number(9),
      mouseKeys: faker.datatype.number(9),
      mouseDistance: faker.datatype.number(9),
      fromAt,
      toAt,
      activityId: activityA.id,
    };
    const data: TimeCreateDto[] = [timeData, timeData];

    const res = await this.http.request({
      url: `${this.url}/api/time/activity`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data,
    });

    const time = await this.timeRepository.findOneByOrFail({
      where: {
        activity: activityA,
      },
    });
    const timeFromAt = moment(time.fromAt).unix();
    const timeToAt = moment(time.toAt).unix();

    expect(res.status).to.be.equal(200);
    expect(timeFromAt).to.be.equal(1705829280);
    expect(timeToAt).to.be.equal(1705829880);
    expect(res.data).to.be.deep.equal([
      {
        index: 1,
        activityId: activityA.id,
        fromAt: timeData.fromAt,
        toAt: timeData.toAt,
        name: 'QueryFailedError',
        message: 'duplicate key value violates unique constraint "UQ_ACTIVITYFROM"',
      },
    ]);
  }
}
