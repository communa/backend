import {inject, injectable} from 'inversify';
import moment from 'moment';

import {Time} from '../entity/Time';
import {User} from '../entity/User';
import {TimeRepository} from '../repository/TimeRepository';
import {ActivityRepository} from '../repository/ActivityRepository';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {ITimeInsertionResult} from '../interface/ITimeInsertionResult';
import {ErrorFormatter} from './ErrorFormatter';
import {TimeCreateDto} from '../validator/dto/TimeCreateDto';
import {Activity} from '../entity/Activity';
import {RedisClient} from './RedisClient';
import {ITimeTotals} from '../interface/ITimeTotals';

@injectable()
export class TimeManager {
  @inject('TimeRepository')
  protected timeRepository: TimeRepository;
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;
  @inject('RedisClient')
  protected redisClient: RedisClient;

  public static reportExpiresIn: number = 1000 * 60 * 10; // 10 minutes

  public async saveMany(data: TimeCreateDto[], user: User): Promise<ITimeInsertionResult[]> {
    const times: ITimeInsertionResult[] = data;

    for (let a = 0; a < times.length; a++) {
      const data = times[a];

      try {
        const time = new Time();

        time.fromAt = moment(data.fromAt).toDate();
        time.toAt = moment(data.toAt).toDate();
        time.note = data.note;
        time.minutesActive = data.minutesActive;
        time.keyboardKeys = data.keyboardKeys;
        time.mouseKeys = data.mouseKeys;
        time.mouseDistance = data.mouseDistance;
        time.activity = await this.activityRepository.findOneByIdOrFail(data.activityId);

        await this.save(time, user);
      } catch (error: any) {
        times[a].error = ErrorFormatter.format(error);
      }
    }

    return times;
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

  public async buildAndCacheReport(
    activity: Activity,
    user: User
  ): Promise<{
    totals: ITimeTotals[];
    time: Time[];
  }> {
    const data = {
      totals: await this.timeRepository.getTotals(user, activity.id),
      time: await this.timeRepository.findAllTimeForActivity(activity, user),
    };

    const cache = await this.redisClient.get(activity.id);

    if (cache) {
      return cache;
    }

    this.redisClient.setWithExpiry(activity.id, data, TimeManager.reportExpiresIn);

    return data;
  }
}
