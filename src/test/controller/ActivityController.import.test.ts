import fs from 'fs';
import {join} from 'path';
import nock from 'nock';
import {expect} from 'chai';
import {suite, test, timeout} from '@testdeck/mocha';

import {Http} from '../../service/Http';
import {BaseControllerTest} from './BaseController.test';
import {UserRepository} from '../../repository/UserRepository';
import {UserFixture} from '../fixture/UserFixture';
import {Authenticator} from '../../service/Authenticator';
import {ActivityRepository} from '../../repository/ActivityRepository';

@suite
export class ActivityControllerImportTest extends BaseControllerTest {
  protected http: Http;
  protected sothebys: string = 'https://www.sothebysrealty.com';
  protected authenticator: Authenticator;
  protected userRepository: UserRepository;
  protected userFixture: UserFixture;
  protected activityRepository: ActivityRepository;

  constructor() {
    super();

    this.userFixture = this.container.get('UserFixture');
    this.http = this.container.get('Http');
    this.authenticator = this.container.get('Authenticator');
    this.activityRepository = this.container.get('ActivityRepository');
    this.userRepository = this.container.get('UserRepository');
  }

  @test
  @timeout(20000)
  async import() {
    const user = await this.userFixture.createUser();
    const html = fs.readFileSync(
      join(__dirname, '../fixture/sothebys/life-of-luxury-miami-beach-opens-a-doorway-of-discovery')
    );

    nock(this.sothebys)
      .get('/extraordinary-living-blog/life-of-luxury-miami-beach-opens-a-doorway-of-discovery')
      .once()
      .reply(200, html);

    const res = await this.http.request({
      url: `${this.url}/api/activity/import`,
      method: 'POST',
      data: {
        url: 'https://www.sothebysrealty.com/extraordinary-living-blog/life-of-luxury-miami-beach-opens-a-doorway-of-discovery',
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticator.getTokens(user).accessToken,
      },
    });

    const id = res.headers.location.split('/')[3];
    const activity = await this.activityRepository.findOneByIdOrFail(id);

    expect(res.status).to.be.equal(201);

    expect(activity.title).to.be.eq('Empty title');
    expect(activity.text.length).to.be.equal(14435);
    expect(activity.sourceUrl).to.be.equal(
      'https://www.sothebysrealty.com/extraordinary-living-blog/life-of-luxury-miami-beach-opens-a-doorway-of-discovery'
    );
  }
}
