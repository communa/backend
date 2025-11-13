import {expect} from 'chai';
import faker from 'faker';
import {suite, test} from '@testdeck/mocha';
import moment from 'moment';
import fs from 'fs';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {TimeRepository} from '../../repository/TimeRepository';
import {TimeCreateDto} from '../../validator/dto/TimeCreateDto';
import {In} from 'typeorm';
import {join} from 'path';

@suite
export class TimeControllerCrudTest extends BaseControllerTest {
  protected timeRepository: TimeRepository;
  protected activityManager: ActivityManager;

  constructor() {
    super();

    this.timeRepository = this.container.get('TimeRepository');
    this.activityManager = this.container.get('ActivityManager');
  }

  @test
  async createPersonalMany() {
    const file = join(__dirname, '../fixture/media/screenshot.webp');
    const stream = fs.readFileSync(file);

    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const activityB = await this.activityFixture.createPersonal(user);
    const activityC = await this.activityFixture.createPersonal(user, 0, true, true);

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
      {
        fromIndex: 3000,
        toIndex: 3001,
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: moment.utc().subtract(10, 'minutes').toISOString(),
        toAt: moment.utc().toISOString(),
        activityId: activityC.id,
        // TODO: use image from the test assets
        screenshot: stream.toString('base64'),
        processes: [
          {
            name: faker.datatype.uuid(),
            description: faker.datatype.uuid(),
            timeMin: faker.datatype.number(9),
          },
        ],
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
    const timeB = await this.timeRepository.findOneByOrFail({
      where: {
        activity: activityB,
      },
    });
    const timeC = await this.timeRepository.findOneByOrFail({
      where: {
        activity: activityC,
      },
    });

    const fromAtA = moment(timeA.fromAt).toISOString();
    const fromAtB = moment(timeB.fromAt).toISOString();
    const fromAtC = moment(timeC.fromAt).toISOString();

    expect(fromAtA).to.be.equal(data[0].fromAt);
    expect(fromAtB).to.be.equal(data[1].fromAt);
    expect(fromAtC).to.be.equal(data[2].fromAt);

    expect(timeA.screenshot).to.be.null;
    expect(timeA.processes).to.be.null;
    expect(timeB.screenshot).to.be.null;
    expect(timeB.processes).to.be.null;
    expect(timeC.screenshot).to.be.not.null;
    expect(timeC.processes).to.be.deep.eq(data[2].processes);

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
  async updatePersonal() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const activityB = await this.activityFixture.createPersonal(user);

    const unix = 1705829280;
    const fromAt = moment.unix(unix);
    const toAt = moment.unix(unix).add(10, 'minutes');

    await this.timeFixture.create(activityB, fromAt.toDate(), toAt.toDate());
    const data: TimeCreateDto[] = [
      {
        fromIndex: 1000,
        toIndex: 1001,
        note: faker.datatype.uuid(),
        keyboardKeys: faker.datatype.number(9),
        minutesActive: faker.datatype.number(9),
        mouseKeys: faker.datatype.number(9),
        mouseDistance: faker.datatype.number(9),
        fromAt: fromAt.toISOString(),
        toAt: toAt.toISOString(),
        activityId: activityA.id,
      },
      {
        fromIndex: 1000,
        toIndex: 1001,
        note: faker.datatype.uuid(),
        keyboardKeys: 100000,
        minutesActive: 100000,
        mouseKeys: 100000,
        mouseDistance: 100000,
        fromAt: fromAt.toISOString(),
        toAt: toAt.toISOString(),
        activityId: activityA.id,
      },
      {
        fromIndex: 2000,
        toIndex: 2001,
        note: faker.datatype.uuid(),
        keyboardKeys: 200000,
        minutesActive: 200000,
        mouseKeys: 200000,
        mouseDistance: 200000,
        fromAt: fromAt.toISOString(),
        toAt: toAt.toISOString(),
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

    const times = await this.timeRepository.findBy({
      where: {
        activity: In([activityA.id, activityB.id]),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    expect(res.data).to.have.length(3);
    expect(times[0].keyboardKeys).to.eq(200000);
    expect(times[0].activity.id).to.eq(activityB.id);
    expect(times[1].keyboardKeys).to.eq(100000);
    expect(times[1].activity.id).to.eq(activityA.id);
  }
}
