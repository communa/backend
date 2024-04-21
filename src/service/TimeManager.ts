import {inject, injectable} from 'inversify';
import moment from 'moment';

import {Time} from '../entity/Time';
import {User} from '../entity/User';
import {TimeRepository} from '../repository/TimeRepository';
import {ActivityRepository} from '../repository/ActivityRepository';
import {ITimeInsertionResult} from '../interface/ITimeInsertionResult';
import {ErrorFormatter} from './ErrorFormatter';
import {TimeCreateDto} from '../validator/dto/TimeCreateDto';
import {Activity} from '../entity/Activity';
import {RedisClient} from './RedisClient';
import {ITimeTotals} from '../interface/ITimeTotals';
import {EActivityState} from '../interface/EActivityState';
import AccessException from '../exception/AccessException';

@injectable()
export class TimeManager {
  @inject('TimeRepository')
  protected timeRepository: TimeRepository;
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;
  @inject('RedisClient')
  protected redisClient: RedisClient;

  public static reportExpiresIn: number = 1000 * 60 * 10; // 10 minutes

  public async createOrUpdateMany(
    data: TimeCreateDto[],
    user: User
  ): Promise<ITimeInsertionResult[]> {
    const times: ITimeInsertionResult[] = data;

    for (let a = 0; a < times.length; a++) {
      const data = times[a];
      const fromAt = moment(data.fromAt).toDate();
      const toAt = moment(data.toAt).toDate();

      try {
        const activity = await this.activityRepository.findActivityAsFreelancerOrFail(
          data.activityId
        );

        const isProposeeAndActive =
          activity.proposalAccepted?.user.id === user.id &&
          activity.state === EActivityState.ACTIVE;
        const isPersonalPublished =
          activity.user.id === user.id && activity.state === EActivityState.PUBLISHED;

        if (!isPersonalPublished && !isProposeeAndActive) {
          throw new AccessException(`The given activity is unavailable for time tracking`);
        }

        let time = await this.timeRepository.findTimeSingleForActivity(activity, fromAt, toAt);

        if (!time) {
          time = new Time();
        }

        time.fromAt = fromAt;
        time.toAt = toAt;
        time.note = data.note;
        time.minutesActive = data.minutesActive;
        time.keyboardKeys = data.keyboardKeys;
        time.mouseKeys = data.mouseKeys;
        time.mouseDistance = data.mouseDistance;
        time.activity = activity;

        await this.timeRepository.validateAndSave(time);
      } catch (error: any) {
        times[a].error = ErrorFormatter.format(error);
      }
    }

    return times;
  }

  public async save(time: Time): Promise<Time> {
    return this.timeRepository.validateAndSave(time);
  }

  public async editAndSave(time: Time, data: Time, freelancer: User) {
    const timeExisting = await this.timeRepository.findTimeByFreelancerOrFail(time, freelancer);

    if (!timeExisting) {
      throw new AccessException(`The given time belongs to someone else`);
    }

    time = Object.assign(time, data);

    await this.timeRepository.validateAndSave(time);
  }

  public async remove(time: Time, freelancer: User) {
    const timeExisting = await this.timeRepository.findTimeByFreelancerOrFail(time, freelancer);

    if (!timeExisting) {
      throw new AccessException(`Wrong user: the given time belongs to someone else`);
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

    await this.redisClient.setWithExpiry(activity.id, data, TimeManager.reportExpiresIn);

    return data;
  }
}
