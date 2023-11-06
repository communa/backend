import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import moment from 'moment';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {EActivityState} from '../../interface/EActivityState';
import {ApplicationRepository} from '../../repository/ApplicationRepository';

@suite
export class TimeControllerTest extends BaseControllerTest {
  protected applicationRepository: ApplicationRepository;
  protected activityManager: ActivityManager;

  constructor() {
    super();

    this.applicationRepository = this.container.get('ApplicationRepository');
    this.activityManager = this.container.get('ActivityManager');
  }

  @test
  async getBusiness() {
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
  async getFreelancer() {
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
}
