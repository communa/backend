import faker from 'faker';
import {inject, injectable} from 'inversify';
import {Activity} from '../../entity/Activity';
import {User} from '../../entity/User';

import {ActivityRepository} from '../../repository/ActivityRepository';
import {EActivityState} from '../../interface/EActivityState';

@injectable()
export class ActivityFixture {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public create(user: User, state: EActivityState, keywords: string[] = []): Promise<Activity> {
    const activity = new Activity();

    activity.title = faker.datatype.uuid();
    activity.text = faker.datatype.uuid();
    activity.user = user;
    activity.state = state;
    activity.keywords = keywords;
    activity.jobUrl = faker.internet.url();

    return this.activityRepository.saveSingle(activity);
  }
}
