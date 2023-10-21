import {inject, injectable} from 'inversify';

import {TimeRepository} from '../repository/TimeRepository';
import {Time} from '../entity/Time';

@injectable()
export class TimeManager {
  @inject('TimeRepository')
  protected timeRepository: TimeRepository;

  public async save(time: Time) {
    return this.timeRepository.validateAndSave(time);
  }
}
