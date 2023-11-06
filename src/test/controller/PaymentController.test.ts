import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {EActivityState} from '../../interface/EActivityState';
import {EPaymentState} from '../../interface/EPaymentState';
import {ApplicationRepository} from '../../repository/ApplicationRepository';

@suite
export class PaymentControllerTest extends BaseControllerTest {
  protected activityManager: ActivityManager;
  protected applicationRepository: ApplicationRepository;

  constructor() {
    super();

    this.applicationRepository = this.container.get('ApplicationRepository');
    this.activityManager = this.container.get('ActivityManager');
  }

  @test
  async getFreelancer() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const application = await this.applicationFixture.create(activity, freelancer);

    await this.activityManager.acceptApplication(activity, application);

    const payment = await this.paymentFixture.create(activity, 50, EPaymentState.PAID);

    const res = await this.http.request({
      url: `${this.url}/api/payment/${payment.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(payment.id);
    expect(res.data.activity.id).to.be.equal(activity.id);
  }

  @test
  async getBusiness() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const application = await this.applicationFixture.create(activity, freelancer);

    await this.activityManager.acceptApplication(activity, application);

    const payment = await this.paymentFixture.create(activity, 50, EPaymentState.PAID);

    const res = await this.http.request({
      url: `${this.url}/api/payment/${payment.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(business).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(payment.id);
    expect(res.data.activity.id).to.be.equal(activity.id);
  }
}
