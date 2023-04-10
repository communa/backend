import { validate } from 'class-validator';
import { inject, injectable } from 'inversify';

import { Activity } from '../entity/Activity';
import { User } from '../entity/User';
import ConstraintsValidationException from '../exception/ConstraintsValidationException';
import { ActivityRepository } from '../repository/ActivityRepository';
import { PageReader } from './import/PageReader';

@injectable()
export class ActivityManager {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;
  @inject('PageReader')
  protected pageReader: PageReader;

  async import(user: User, url: string) {
    const data = await this.pageReader.readByUrl(url);
    const activity = new Activity();

    activity.title = data.title;
    activity.text = data.text;
    activity.user = user;
    activity.sourceUrl = url;
    activity.title = this.getTitle(activity);
    // activity.tags = await this.processTags(activity);
    // activity.locations = await this.processLocations(activity);
    // activity.files = await this.processImages(activity);

    return this.validateAndSave(activity);
  }

  editValidateAndSave(activity: Activity, data: Activity) {
    activity.title = data.title;
    activity.text = data.text;

    void this.validateAndSave(activity);
  }

  async validateAndSave(activity: Activity) {
    const errors = await validate(activity);

    if (errors.length) {
      throw new ConstraintsValidationException(errors);
    }

    activity.title = this.getTitle(activity);
    // activity.tags = await this.processTags(activity);
    // activity.locations = await this.processLocations(activity);
    // activity.files = await this.processImages(activity);

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

  public getIntro(activity: Activity): string {
    if (activity.text.blocks) {
      const blocks = activity.text.blocks.filter((b: any) => b.type === 'paragraph');

      if (blocks.length > 0) {
        return blocks[0].data.text;
      }
    }

    return '';
  }
}
