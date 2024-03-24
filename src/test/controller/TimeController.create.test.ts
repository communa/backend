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
        fromIndex: 1000,
        toIndex: 1001,
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').toISOString(),
        toAt: moment.utc().toISOString(),
        activityId: activityA.id,
      },
      {
        fromIndex: 2000,
        toIndex: 2001,
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').toISOString(),
        toAt: moment.utc().toISOString(),
        activityId: activityB.id,
      },
    ];

    const res = await this.http.request({
      url: `${this.url}/api/time`,
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

    const fromAtA = moment(timeA.fromAt).toISOString();

    expect(fromAtA).to.be.equal(data[0].fromAt);
    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal(data);
  }

  @test
  async createPersonalInputValidationErrorA() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const unix = moment().utc();
    const data: TimeCreateDto[] = [
      {
        fromIndex: 1000,
        toIndex: 1001,
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment(unix).subtract(10, 'minutes').toISOString(),
        toAt: moment(unix).toISOString(),
        activityId: activityA.id,
      },
      {
        fromIndex: 2000,
        toIndex: 2001,
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment(unix).subtract(10, 'minutes').toISOString(),
        toAt: moment(unix).toISOString(),
        activityId: '',
      },
    ];

    const res = await this.http.request({
      url: `${this.url}/api/time`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data,
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal([
      data[0],
      {
        ...data[1],
        error: {
          name: 'QueryFailedError',
          message: 'invalid input syntax for type uuid: ""',
        },
      },
    ]);
  }

  @test
  async createPersonalInputValidationErrorB() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const data = [
      {
        fromIndex: 1000,
        toIndex: 1001,
        fromAt: moment.utc().subtract(10, 'minutes').toISOString(),
        toAt: moment.utc().toISOString(),
        note: faker.datatype.uuid(),
        activityId: activityA.id,
      },
    ];

    const res = await this.http.request({
      url: `${this.url}/api/time`,
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
        ...data[0],
        error: {
          name: 'ConstraintsValidationException',
          message: 'Constraint validation error has occurred.',
          errors: [
            {
              property: 'keyboardKeys',
              constraints: {
                isNumber: 'keyboardKeys must be a number conforming to the specified constraints',
              },
              children: [],
            },
            {
              property: 'minutesActive',
              constraints: {
                isNumber: 'minutesActive must be a number conforming to the specified constraints',
              },
              children: [],
            },
            {
              property: 'mouseKeys',
              constraints: {
                isNumber: 'mouseKeys must be a number conforming to the specified constraints',
              },
              children: [],
            },
            {
              property: 'mouseDistance',
              constraints: {
                isNumber: 'mouseDistance must be a number conforming to the specified constraints',
              },
              children: [],
            },
          ],
        },
      },
    ]);
  }

  @test
  async createPersonalDuplicationError() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const unix = 1705829280;
    const fromAt = moment.unix(unix).toISOString();
    const toAt = moment.unix(unix).add(10, 'minutes').toDate().toISOString();
    const timeData = {
      fromIndex: 1000,
      toIndex: 1001,
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
      url: `${this.url}/api/time`,
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
    const timeFromAt = moment(time.fromAt).toISOString();
    const timeToAt = moment(time.toAt).toISOString();

    expect(res.status).to.be.equal(200);
    expect(timeFromAt).to.be.equal(fromAt);
    expect(timeToAt).to.be.equal(toAt);

    expect(res.data).to.be.deep.equal([
      data[0],
      {
        ...data[1],
        error: {
          message: 'duplicate key value violates unique constraint "UQ_ACTIVITYFROM"',
          name: 'QueryFailedError',
        },
      },
    ]);
  }
}
