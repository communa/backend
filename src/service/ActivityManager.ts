import {validate} from 'class-validator';
import {inject, injectable} from 'inversify';

import {Activity} from '../entity/Activity';
import {User} from '../entity/User';
import ConstraintsValidationException from '../exception/ConstraintsValidationException';
import {ActivityRepository} from '../repository/ActivityRepository';
import {PageReader} from './import/PageReader';
import {EActivityState} from '../interface/EActivityState';
import {EActivityType} from '../interface/EActivityType';

@injectable()
export class ActivityManager {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;
  @inject('PageReader')
  protected pageReader: PageReader;

  async import(user: User, url: string) {
    const data = await this.pageReader.readByUrl(url);
    const activity = new Activity();

    activity.text = data.text;
    activity.user = user;
    activity.sourceUrl = url;
    activity.title = this.getTitle(activity);
    activity.state = EActivityState.PUBLISHED;
    activity.type = EActivityType.IMPORT;

    return this.validateAndSave(activity);
  }

  editValidateAndSave(activity: Activity, data: Activity) {
    activity = Object.assign(activity, data);

    void this.validateAndSave(activity);
  }

  async validateAndSave(activity: Activity) {
    const errors = await validate(activity);

    if (errors.length) {
      throw new ConstraintsValidationException(errors);
    }

    return this.activityRepository.saveSingle(activity);
  }

  public getTitle(activity: Activity): string {
    if (activity.text.blocks) {
      const blocks = activity.text.blocks.filter((b: any) => b.type === 'header');

      if (blocks.length > 0) {
        return blocks[0].data.text;
      }
    }
    return 'Empty title';
  }
}
