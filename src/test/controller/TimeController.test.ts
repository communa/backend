import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import moment from 'moment';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {EActivityState} from '../../interface/EActivityState';
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
    const proposal = await this.proposalFixture.create(activity, freelancer);
    await this.activityManager.acceptProposal(activity, proposal);

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
    const proposal = await this.proposalFixture.create(activity, freelancer);
    await this.activityManager.acceptProposal(activity, proposal);

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

  @test
  async searchPersonalById() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const activityB = await this.activityFixture.createPersonal(user);
    const timeA = await this.timeFixture.create(
      activityA,
      moment.utc().subtract(60, 'minutes').toDate(),
      moment.utc().toDate()
    );
    await this.timeFixture.create(
      activityB,
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
        filter: {
          activityId: activityA.id,
        },
        sort: {createdAt: 'DESC'},
        page: 0,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(timeA.id);
    expect(res.data[0][0].note).to.be.deep.eq(timeA.note);
  }

  @test
  async getTotals() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const activityB = await this.activityFixture.createPersonal(user);
    await this.timeFixture.create(
      activityA,
      moment.utc().subtract(60, 'minutes').toDate(),
      moment.utc().toDate()
    );
    await this.timeFixture.create(
      activityB,
      moment.utc().subtract(60, 'minutes').toDate(),
      moment.utc().toDate()
    );

    const res = await this.http.request({
      url: `${this.url}/api/time/totals`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.length).to.be.eq(2);
  }

  @test
  async getTotalsActivity() {
    const user = await this.userFixture.createUser();
    const activityA = await this.activityFixture.createPersonal(user);
    const activityB = await this.activityFixture.createPersonal(user);
    const timeA = await this.timeFixture.create(
      activityA,
      moment.utc().subtract(60, 'minutes').toDate(),
      moment.utc().toDate()
    );
    await this.timeFixture.create(
      activityB,
      moment.utc().subtract(60, 'minutes').toDate(),
      moment.utc().toDate()
    );

    const res = await this.http.request({
      url: `${this.url}/api/time/totals?activityId=${activityA.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data[0].activityId).to.be.eq(activityA.id);
    expect(res.data[0].rateHour).to.be.eq(activityA.rateHour);
    expect(res.data[0].minutes).to.be.eq(1);
    expect(res.data[0].minutesActive).to.be.eq(timeA.minutesActive);
    expect(res.data[0].mouseKeys).to.be.eq(timeA.mouseKeys);
    expect(res.data[0].keyboardKeys).to.be.eq(timeA.keyboardKeys);
    expect(res.data[0].mouseDistance).to.be.eq(timeA.mouseDistance);
  }
}
