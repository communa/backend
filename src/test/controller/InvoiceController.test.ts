import {expect} from 'chai';
import {skip, suite, test} from '@testdeck/mocha';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {EActivityState} from '../../interface/EActivityState';
import {EInvoiceState} from '../../interface/EInvoiceState';
import {ApplicationRepository} from '../../repository/ApplicationRepository';

@suite
@skip
export class InvoiceControllerTest extends BaseControllerTest {
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

    const invoice = await this.invoiceFixture.create(activity, 50, EInvoiceState.PAID);

    const res = await this.http.request({
      url: `${this.url}/api/invoice/${invoice.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(invoice.id);
    expect(res.data.activity.id).to.be.equal(activity.id);
  }

  @test
  async getBusiness() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const application = await this.applicationFixture.create(activity, freelancer);

    await this.activityManager.acceptApplication(activity, application);

    const invoice = await this.invoiceFixture.create(activity, 50, EInvoiceState.PAID);

    const res = await this.http.request({
      url: `${this.url}/api/invoice/${invoice.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(business).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(invoice.id);
    expect(res.data.activity.id).to.be.equal(activity.id);
  }
}
