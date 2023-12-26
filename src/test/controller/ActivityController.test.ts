import faker from 'faker';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {ActivityRepository} from '../../repository/ActivityRepository';
import {EActivityState} from '../../interface/EActivityState';
import {Activity} from '../../entity/Activity';
import {EActivityType} from '../../interface/EActivityType';

@suite
export class ActivityControllerTest extends BaseControllerTest {
  protected activityManager: ActivityManager;
  protected activityRepository: ActivityRepository;

  constructor() {
    super();

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
  async accept() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const application = await this.applicationFixture.create(activity, freelancer);

    const res = await this.http.request({
      url: `${this.url}/api/activity/${activity.id}/accept/${application.id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(business).accessToken,
      },
    });

    const updated = (await this.activityRepository.findOneByQueryBuilder({id: activity.id}, null, {
      applicationAccepted: true,
    })) as Activity;

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});
    expect(updated.state).to.be.eq(EActivityState.ACTIVE);
    expect(updated.startedAt).to.be.not.null;
  }

  @test
  async close() {
    const business = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);

    const res = await this.http.request({
      url: `${this.url}/api/activity/${activity.id}/close`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(business).accessToken,
      },
    });

    const updated = await this.activityRepository.findOneByIdOrFail(activity.id);

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});
    expect(updated.state).to.be.eq(EActivityState.CLOSED);
    expect(updated.closedAt).to.be.not.null;
  }

  @test
  async create() {
    const business = await this.userFixture.createUser();
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
        Authorization: this.authenticator.getTokens(business).accessToken,
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
    const business = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.DRAFT);

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
        Authorization: this.authenticator.getTokens(business).accessToken,
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
    const business = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);

    const res = await this.http.request({
      url: `${this.url}/api/activity/${activity.id}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(business).accessToken,
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
  async searchFreelancer() {
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.createPersonal(freelancer);

    await this.applicationFixture.create(activity, freelancer);

    const config = {
      url: `${this.url}/api/activity/search/freelancer`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
      data: {
        filter: {},
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(activity.id);
    expect(res.data[0][0].state).to.be.eq(EActivityState.PUBLISHED);
    expect(res.data[0][0].type).to.be.eq(EActivityType.PERSONAL);
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
