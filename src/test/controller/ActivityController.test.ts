import faker from 'faker';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';

import {Http} from '../../service/Http';
import {BaseControllerTest} from './BaseController.test';
import {UserFixture} from '../fixture/UserFixture';
import {ActivityManager} from '../../service/ActivityManager';
import {ActivityFixture} from '../fixture/ActivityFixture';
import {ActivityRepository} from '../../repository/ActivityRepository';
import {EActivityState} from '../../interface/EActivityState';
import {Authenticator} from '../../service/Authenticator';

@suite
export class ActivityControllerTest extends BaseControllerTest {
  protected http: Http;
  protected authenticator: Authenticator;
  protected activityManager: ActivityManager;
  protected activityFixture: ActivityFixture;
  protected activityRepository: ActivityRepository;
  protected userFixture: UserFixture;

  constructor() {
    super();

    this.authenticator = this.container.get('Authenticator');
    this.userFixture = this.container.get('UserFixture');
    this.http = this.container.get('Http');
    this.activityFixture = this.container.get('ActivityFixture');
    this.activityRepository = this.container.get('ActivityRepository');
    this.activityManager = this.container.get('ActivityManager');
  }

  @test
  async get() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user, EActivityState.PUBLISHED);

    const res = await this.http.request({
      url: `${this.url}/api/activity/${activity.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(activity.id);
  }

  @test
  async post() {
    const user = await this.userFixture.createUser();
    const data = {
      title: faker.datatype.uuid(),
      text: faker.datatype.uuid(),
      state: EActivityState.DRAFT,
    };

    const res = await this.http.request({
      url: `${this.url}/api/activity`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data,
    });

    const id = res.headers.location.split('/')[3];
    const activity = await this.activityRepository.findOneByIdOrFail(id);

    expect(res.status).to.be.equal(201);

    expect(activity.title).to.be.eq(data.title);
    expect(activity.text).to.be.eq(data.text);
  }

  @test
  async edit() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user, EActivityState.DRAFT);

    const data = {
      title: faker.datatype.uuid(),
      text: faker.datatype.uuid(),
      state: EActivityState.PUBLISHED,
    };

    const res = await this.http.request({
      url: `${this.url}/api/activity/${activity.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data,
    });

    const activityUpdated = await this.activityRepository.findOneByIdOrFail(activity.id);

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});

    expect(activityUpdated.title).to.be.eq(data.title);
    expect(activityUpdated.state).to.be.eq(data.state);
    expect(activityUpdated.text).to.be.eq(data.text);
  }

  @test
  async delete() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user, EActivityState.PUBLISHED);

    const res = await this.http.request({
      url: `${this.url}/api/activity/${activity.id}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});
  }

  @test()
  async searchKeywordsPositiveA() {
    const keywords = [faker.datatype.uuid(), faker.datatype.uuid(), faker.datatype.uuid()];
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user, EActivityState.PUBLISHED, keywords);

    const config = {
      url: `${this.url}/api/activity/search`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data: {
        filter: {
          userId: user.id,
          keywords: [keywords[0], keywords[1]],
        },
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(activity.id);
    expect(res.data[0][0].keywords).to.be.deep.eq(keywords);
  }

  @test()
  async searchKeywordsPositiveB() {
    const keywords = [faker.datatype.uuid(), faker.datatype.uuid(), faker.datatype.uuid()];
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user, EActivityState.PUBLISHED, keywords);

    const config = {
      url: `${this.url}/api/activity/search`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data: {
        filter: {
          userId: user.id,
          keywords: [keywords[0], keywords[1], 'AAAA'],
        },
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(activity.id);
    expect(res.data[0][0].keywords).to.be.deep.eq(keywords);
  }

  @test()
  async searchKeywordsNegatve() {
    const keywords = [faker.datatype.uuid(), faker.datatype.uuid(), faker.datatype.uuid()];
    const user = await this.userFixture.createUser();

    await this.activityFixture.create(user, EActivityState.PUBLISHED, keywords);

    const config = {
      url: `${this.url}/api/activity/search`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data: {
        filter: {
          userId: user.id,
          keywords: ['AAAA'],
        },
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data).to.be.deep.eq([[], 0]);
  }

  @test()
  async searchPublishingDraft() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user, EActivityState.DRAFT);

    const config = {
      url: `${this.url}/api/activity/search/publishing`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data: {
        filter: {
          userId: user.id,
          state: EActivityState.DRAFT,
        },
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(activity.id);
    expect(res.data[0][0].state).to.be.eq(EActivityState.DRAFT);
  }

  @test()
  async searchPublishingArchived() {
    const user = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(user, EActivityState.ARCHIVED);

    const config = {
      url: `${this.url}/api/activity/search/publishing`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
      data: {
        filter: {
          userId: user.id,
          state: EActivityState.ARCHIVED,
        },
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(activity.id);
    expect(res.data[0][0].state).to.be.eq(EActivityState.ARCHIVED);
  }
}
