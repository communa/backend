import {inject, injectable} from 'inversify';

import {Time} from '../entity/Time';
import {User} from '../entity/User';
import {TimeRepository} from '../repository/TimeRepository';
import {ActivityRepository} from '../repository/ActivityRepository';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {Activity} from '../entity/Activity';

@injectable()
export class TimeManager {
  @inject('TimeRepository')
  protected timeRepository: TimeRepository;
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public async save(time: Time, activity: Activity, freelancer: User): Promise<Time> {
    const activityExisting = await this.activityRepository.findActivityByFreelancerOrFail(activity, freelancer,);

    if (activityExisting.closedAt) {
      throw new RejectedExecutionException(`Time can not be editited on closed activities`);
    }

    return this.timeRepository.validateAndSave(time);
  }

  public async editAndSave(time: Time, data: Time, freelancer: User) {
    const timeExisting = await this.timeRepository.findTimeByFreelancerOrFail(time, freelancer);

    if (!timeExisting) {
      throw new RejectedExecutionException(`Wrong user: the given time belongs to someone else`);
    }

    time = Object.assign(time, data);

    await this.timeRepository.validateAndSave(time);
  }

  public async remove(time: Time, freelancer: User) {
    const timeExisting = await this.timeRepository.findTimeByFreelancerOrFail(time, freelancer);

    if (!timeExisting) {
      throw new RejectedExecutionException(`Wrong user: the given time belongs to someone else`);
    }

    await this.timeRepository.remove(timeExisting);
  }
}
