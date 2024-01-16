import {inject, injectable} from 'inversify';

import {Time} from '../entity/Time';
import {User} from '../entity/User';
import {TimeRepository} from '../repository/TimeRepository';
import {ActivityRepository} from '../repository/ActivityRepository';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {Activity} from '../entity/Activity';
import {ITimeInsertionError} from '../interface/ITimeInsertionError';
import {ErrorFormatter} from './ErrorFormatter';

@injectable()
export class TimeManager {
  @inject('TimeRepository')
  protected timeRepository: TimeRepository;
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public async saveMany(times: Time[], user: User): Promise<ITimeInsertionError[]> {
    const errors: ITimeInsertionError[] = [];

    for (let a = 0; a < times.length; a++) {
      const data = times[a];

      try {
        const activity = await this.activityRepository.findOneByIdOrFail(data.activity.id);
        await this.save(data, activity, user);
      } catch (error: any) {
        const errorFormatted = ErrorFormatter.format(error);

        errors.push({
          index: a,
          name: errorFormatted.name,
          message: errorFormatted.message,
        });
      }
    }

    return errors;
  }

  public async save(time: Time, activity: Activity, user: User): Promise<Time> {
    const activities = [
      await this.activityRepository.findActivityByFreelancer(activity, user),
      await this.activityRepository.findActivityPersonal(activity, user),
    ];

    const activityValid = activities.find(a => a !== undefined);

    if (!activityValid) {
      throw new RejectedExecutionException(`The given activity is unavailable for time tracking`);
    }

    time.activity = activityValid;

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
