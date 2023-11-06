import {inject, injectable} from 'inversify';

import {Activity} from '../entity/Activity';
import {ActivityRepository} from '../repository/ActivityRepository';
import {Application} from '../entity/Application';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {EActivityState} from '../interface/EActivityState';

@injectable()
export class ActivityManager {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public async close(activity: Activity): Promise<void> {
    activity.closedAt = new Date();
    activity.state = EActivityState.CLOSED;

    await this.save(activity);
  }

  public async acceptApplication(activity: Activity, application: Application): Promise<void> {
    if (activity.applicationAccepted) {
      throw new RejectedExecutionException('Application was already assigned');
    }

    activity.applicationAccepted = application;
    activity.startedAt = new Date();
    activity.state = EActivityState.STARTED;

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
