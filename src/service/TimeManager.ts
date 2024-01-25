import {inject, injectable} from 'inversify';
import moment from 'moment';

import {Time} from '../entity/Time';
import {User} from '../entity/User';
import {TimeRepository} from '../repository/TimeRepository';
import {ActivityRepository} from '../repository/ActivityRepository';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {ITimeInsertionError} from '../interface/ITimeInsertionError';
import {ErrorFormatter} from './ErrorFormatter';
import {TimeCreateDto} from '../validator/dto/TimeCreateDto';

@injectable()
export class TimeManager {
  @inject('TimeRepository')
  protected timeRepository: TimeRepository;
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public async saveMany(times: TimeCreateDto[], user: User): Promise<ITimeInsertionError[]> {
    const errors: ITimeInsertionError[] = [];

    for (let a = 0; a < times.length; a++) {
      const data = times[a];

      try {
        const time = new Time();

        time.fromAt = moment.unix(data.fromAt).toDate();
        time.toAt = moment.unix(data.toAt).toDate();
        time.note = data.note;
        time.keyboardKeys = data.keyboardKeys;
        time.mouseKeys = data.mouseKeys;
        time.mouseDistance = data.mouseDistance;
        time.activity = await this.activityRepository.findOneByIdOrFail(data.activityId);

        await this.save(time, user);
      } catch (error: any) {
        const errorFormatted = ErrorFormatter.format(error);

        errors.push({
          index: a,
          activityId: data.activityId,
          fromAt: data.fromAt,
          toAt: data.toAt,
          name: errorFormatted.name,
          message: errorFormatted.message,
          errors: errorFormatted.errors,
        });
      }
    }

    return errors;
  }

  public async save(time: Time, user: User): Promise<Time> {
    const activities = [
      await this.activityRepository.findActivityByFreelancer(time.activity, user),
      await this.activityRepository.findActivityPersonal(time.activity, user),
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
