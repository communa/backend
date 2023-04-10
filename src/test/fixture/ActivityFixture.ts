import faker from 'faker';
import { inject, injectable } from 'inversify';
import { Activity } from '../../entity/Activity';
import { User } from '../../entity/User';

import { ActivityRepository } from '../../repository/ActivityRepository';

@injectable()
export class ActivityFixture {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public create(user: User): Promise<Activity> {
    const activity = new Activity();

    activity.title = faker.datatype.uuid();
    activity.text = faker.datatype.uuid();
    activity.user = user;
    activity.jobUrl = faker.internet.url();

    return this.activityRepository.saveSingle(activity);
  }
}
