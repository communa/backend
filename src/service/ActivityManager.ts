import {inject, injectable} from 'inversify';

import {Activity} from '../entity/Activity';
import {ActivityRepository} from '../repository/ActivityRepository';
import {Proposal} from '../entity/Proposal';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {EActivityState} from '../interface/EActivityState';
import {User} from '../entity/User';
import {EActivityType} from '../interface/EActivityType';
import moment from 'moment';
import {Time} from '../entity/Time';
import {TimeRepository} from '../repository/TimeRepository';

@injectable()
export class ActivityManager {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;
  @inject('TimeRepository')
  protected timeRepository: TimeRepository;

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

  public async createDemoData(user: User): Promise<void> {
    const activity = new Activity();
    activity.title = 'Your first project';
    activity.rateHour = 0;
    activity.user = user;
    activity.type = EActivityType.PERSONAL;
    activity.state = EActivityState.PUBLISHED;

    await this.save(activity);

    const times = [];
    const fromAt = moment().startOf('day');
    const toAt = moment().startOf('day').add(10, 'minutes');

    for (let i = 0; i < 6; i++) {
      const time = new Time();
      time.activity = activity;
      time.note = `Timesheet demo ${i}`;
      time.mouseKeys = 0;
      time.mouseDistance = 0;
      time.keyboardKeys = 0;
      time.minutesActive = i;
      time.fromAt = fromAt.toDate();
      time.toAt = toAt.toDate();

      times.push(time);

      fromAt.add(1 * 10, 'minutes');
      toAt.add(1 * 10, 'minutes');
    }

    await this.timeRepository.saveMany(times);
  }
}
