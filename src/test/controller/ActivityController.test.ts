import faker from 'faker';
import { expect } from 'chai';
import { suite, test } from '@testdeck/mocha';

import { Http } from '../../service/Http';
import { BaseControllerTest } from './BaseController.test';
import { UserFixture } from '../fixture/UserFixture';
import { ActivityManager } from '../../service/ActivityManager';
import { ActivityFixture } from '../fixture/ActivityFixture';
import { ActivityRepository } from '../../repository/ActivityRepository';

@suite
export class ActivityControllerTest extends BaseControllerTest {
  protected http: Http;
  protected activityManager: ActivityManager;
  protected activityFixture: ActivityFixture;
  protected activityRepository: ActivityRepository;
  protected userFixture: UserFixture;

  constructor() {
    super();

    this.userFixture = this.container.get('UserFixture');
    this.http = this.container.get('Http');
    this.activityFixture = this.container.get('ActivityFixture');
    this.activityRepository = this.container.get('ActivityRepository');
    this.activityManager = this.container.get('ActivityManager');
  }

  @test
  async get() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user);

    const res = await this.http.request({
      url: `${this.url}/api/activity/${activity.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticatorTest.login(user).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(activity.id);
  }

  @test
  async post() {
    const user = await this.userFixture.createUser();
    const data = {
      text: faker.datatype.uuid(),
    };

    const res = await this.http.request({
      url: `${this.url}/api/activity`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticatorTest.login(user).accessToken,
      },
      data,
    });

    const id = res.headers.location.split('/')[3];
    const activity = await this.activityRepository.findOneByIdOrFail(id);

    expect(res.status).to.be.equal(201);

    expect(activity.title).to.be.eq('Empty title');
    expect(activity.text).to.be.eq(data.text);
  }

  @test
  async delete() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user);

    const res = await this.http.request({
      url: `${this.url}/api/activity/${activity.id}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticatorTest.login(user).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});
  }

  @test()
  async search() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user);

    const config = {
      url: `${this.url}/api/activity/search`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticatorTest.login(user).accessToken,
      },
      data: {
        filter: {
          userId: user.id,
        },
        sort: { createdAt: 'ASC' },
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(activity.id);
    // expect(res.data[0][0].user.id).to.be.eq(user.id);
  }
}
