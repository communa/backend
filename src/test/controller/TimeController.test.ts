import {expect} from 'chai';
import faker from 'faker';
import {suite, test} from '@testdeck/mocha';
import moment from 'moment';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {EActivityState} from '../../interface/EActivityState';
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
  async getTimePublishedBusiness() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const application = await this.applicationFixture.create(activity, freelancer);
    await this.activityManager.acceptApplication(activity, application);

    const time = await this.timeFixture.create(
      activity,
      moment.utc().subtract(60, 'minutes').toDate(),
      moment.utc().toDate()
    );

    const res = await this.http.request({
      url: `${this.url}/api/time/${time.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(business).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(time.id);
    expect(res.data.activity.id).to.be.equal(activity.id);
  }

  @test
  async getTimePublishedFreelancer() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const application = await this.applicationFixture.create(activity, freelancer);
    await this.activityManager.acceptApplication(activity, application);

    const time = await this.timeFixture.create(
      activity,
      moment.utc().subtract(60, 'minutes').toDate(),
      moment.utc().toDate()
    );

    const res = await this.http.request({
      url: `${this.url}/api/time/${time.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(time.id);
    expect(res.data.activity.id).to.be.equal(activity.id);
  }

  @test
  async createTimePersonalProject() {
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
  async searchPersonal() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.createPersonal(user);
    const time = await this.timeFixture.create(
      activity,
      moment.utc().subtract(60, 'minutes').toDate(),
      moment.utc().toDate()
    );

    const res = await this.http.request({
      url: `${this.url}/api/time/search`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data: {
        filter: {},
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(time.id);
    expect(res.data[0][0].note).to.be.deep.eq(time.note);
  }

}
