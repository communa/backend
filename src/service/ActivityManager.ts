import {inject, injectable} from 'inversify';

import {Activity} from '../entity/Activity';
import {ActivityRepository} from '../repository/ActivityRepository';
import {Application} from '../entity/Application';

@injectable()
export class ActivityManager {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public async close(activity: Activity): Promise<void> {
    activity.finishedAt = new Date();

    await this.save(activity);
  }

  public async acceptApplication(activity: Activity, application: Application): Promise<void> {
    activity.applicationAccepted = application;
    activity.acceptedAt = new Date();

    await this.save(activity);
  }

  public async editAndSave(activity: Activity, data: Activity): Promise<void> {
    activity = Object.assign(activity, data);

    await this.save(activity);
  }

  public save(activity: Activity) {
    return this.activityRepository.saveSingle(activity);
  }
}
