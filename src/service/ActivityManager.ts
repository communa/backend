import {inject, injectable} from 'inversify';

import {Activity} from '../entity/Activity';
import {ActivityRepository} from '../repository/ActivityRepository';
import {Proposal} from '../entity/Proposal';
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

  public async acceptProposal(activity: Activity, proposal: Proposal): Promise<void> {
    if (activity.proposalAccepted) {
      throw new RejectedExecutionException('Proposal was already assigned');
    }

    activity.proposalAccepted = proposal;
    activity.startedAt = new Date();
    activity.state = EActivityState.ACTIVE;

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
