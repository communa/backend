import faker from 'faker';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';

import {BaseControllerTest} from './BaseController.test';
import {ActivityManager} from '../../service/ActivityManager';
import {ProposalRepository} from '../../repository/ProposalRepository';
import {EActivityState} from '../../interface/EActivityState';

@suite
export class ProposalControllerTest extends BaseControllerTest {
  protected activityManager: ActivityManager;
  protected proposalRepository: ProposalRepository;

  constructor() {
    super();

    this.proposalRepository = this.container.get('ProposalRepository');
    this.activityManager = this.container.get('ActivityManager');
  }

  @test
  async get() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const proposal = await this.proposalFixture.create(activity, freelancer);

    const res = await this.http.request({
      url: `${this.url}/api/proposal/${proposal.id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.id).to.be.equal(proposal.id);
  }

  @test
  async edit() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const proposal = await this.proposalFixture.create(activity, freelancer);

    const data = {
      text: faker.datatype.uuid(),
      rate: faker.datatype.number(),
    };

    const res = await this.http.request({
      url: `${this.url}/api/proposal/${proposal.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
      data,
    });

    const proposalUpdated = await this.proposalRepository.findOneByIdOrFail(proposal.id);

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});

    expect(proposalUpdated.text).to.be.eq(data.text);
    expect(proposalUpdated.rate).to.be.eq(data.rate);
  }

  @test
  async post() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);

    const data = {
      activity: {
        id: activity.id,
      },
      text: faker.datatype.uuid(),
      rate: faker.datatype.number(),
    };

    const res = await this.http.request({
      url: `${this.url}/api/proposal`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
      data,
    });

    const id = res.headers.location.split('/')[3];
    const proposal = await this.proposalRepository.findOneByIdOrFail(id);

    expect(res.status).to.be.equal(201);
    expect(res.data).to.be.deep.equal({});

    expect(proposal.text).to.be.eq(data.text);
    expect(proposal.rate).to.be.eq(data.rate);
  }

  @test
  async delete() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const proposal = await this.proposalFixture.create(activity, freelancer);

    const res = await this.http.request({
      url: `${this.url}/api/proposal/${proposal.id}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});
  }

  @test()
  async searchAsBusiness() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const proposal = await this.proposalFixture.create(activity, freelancer);

    const config = {
      url: `${this.url}/api/proposal/search/business`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(business).accessToken,
      },
      data: {
        filter: {
          activityId: activity.id,
        },
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(proposal.id);
  }

  @test()
  async searchAsFreelancer() {
    const business = await this.userFixture.createUser();
    const freelancer = await this.userFixture.createUser();
    const activity = await this.activityFixture.create(business, EActivityState.PUBLISHED);
    const proposal = await this.proposalFixture.create(activity, freelancer);

    const config = {
      url: `${this.url}/api/proposal/search/freelancer`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(freelancer).accessToken,
      },
      data: {
        filter: {
          activityId: activity.id,
        },
        sort: {createdAt: 'ASC'},
        page: 0,
      },
    };

    const res = await this.http.request(config);

    expect(res.data[0].length).to.be.eq(1);
    expect(res.data[0][0].id).to.be.eq(proposal.id);
  }
}
