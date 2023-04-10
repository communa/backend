import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';

import {Http} from '../../service/Http';
import {BaseControllerTest} from './BaseController.test';
import {UserFixture} from '../fixture/UserFixture';
import {ActivityRepository} from '../../repository/ActivityRepository';
import {TagRepository} from '../../repository/TagRepository';
import {TagFixture} from '../fixture/TagFixture';

@suite
export class TagControllerTest extends BaseControllerTest {
  protected http: Http;
  protected tagRepository: TagRepository;
  protected tagFixture: TagFixture;
  protected activityRepository: ActivityRepository;
  protected userFixture: UserFixture;

  constructor() {
    super();

    this.http = this.container.get('Http');
    this.tagRepository = this.container.get('TagRepository');
    this.tagFixture = this.container.get('TagFixture');
    this.userFixture = this.container.get('UserFixture');
  }

  @test
  async follow() {
    const user = await this.userFixture.createUser();
    const activity = await this.tagFixture.createTag();

    const res = await this.http.request({
      url: `${this.url}/api/tag/${activity.id}/follow`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticatorTest.login(user).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
  }

  @test
  async unFollow() {
    const user = await this.userFixture.createUser();
    const tag = await this.tagFixture.createTag();
    await this.tagFixture.createTagFollowed(tag, user);

    const res = await this.http.request({
      url: `${this.url}/api/tag/${tag.id}/follow`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authenticatorTest.login(user).accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
  }
}
