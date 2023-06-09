import { inject, injectable } from 'inversify';
import { validate } from 'class-validator';

import { Activity } from '../entity/Activity';
import { ActivityRepository } from '../repository/ActivityRepository';
import { IText } from '../interface/IText';
import ConstraintsValidationException from '../exception/ConstraintsValidationException';
import * as cheerio from 'cheerio';
import { EActivityCancellationReason } from '../interface/EActivityCancellationReason';
import { EActivityState } from '../interface/EActivityState';
import { EActivityType } from '../interface/EActivityType';


@injectable()
export class ActivityBuilder {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public async build(page: IText): Promise<Activity | null> {
    const $ = cheerio.load(page.html);
    const items: string[] = [];
    const hostname = (new URL(page.url)).hostname;


    $('.row-start-1 .text-gray-600').each((_i, el) => {
      const text = $(el).text().replace((/  |\r\n|\n|\r/gm), "").trim();
      items.push(text);
    });

    const body = $('.prose').html()?.trim() || '';
    const jobUrl = $('a:contains("Apply")').attr('href');

    console.log(page.url, jobUrl);

    // skip if no tags available
    if (items.length === 0) {
      return null;
    }

    // // skip if hostname is mentioned withing the body
    // if (body.indexOf(hostname) > -1) {
    //   return null;
    // }

    let activity = await this.activityRepository.findOneByUrl(page.url);

    if (!activity) {
      activity = new Activity();

      activity.title = page.title;
      activity.text = body;
      activity.sourceUrl = page.url;
    } else {
      if (activity.title !== page.title) {
        activity.title = page.title;
      }
      if (activity.text !== body) {
        activity.text = body;
      }
    }

    if (items.length === 7) {
      activity.location = items[0].replace(' ', '');
      activity.employment = items[1].split(',');
      activity.position = items[2];
      activity.salary = items[3];
      activity.keywords = items[4].split(',');
    }
    if (items.length === 6) {
      activity.location = items[0].replace(' ', '');
      activity.employment = items[1].split(',');
      activity.position = items[2];
      activity.keywords = items[3].split(',');
    }
    if (jobUrl) {
      activity.jobUrl = jobUrl;
    }
    activity.processedAt = new Date();
    activity.state = EActivityState.PUBLISHED;
    activity.type = EActivityType.IMPORT;

    if (page.html.indexOf('Looks like this career opportunity is no longer available') > -1) {
      activity.cancelledAt = new Date();
      activity.state = EActivityState.REMOVED;
      activity.cancellationReason = EActivityCancellationReason.FILLED_OR_CLOSED;
    }
    // skip if hostname is mentioned withing the body
    if (activity.text.indexOf(hostname) > -1) {
      activity.cancelledAt = new Date();
      activity.state = EActivityState.REMOVED;
      activity.cancellationReason = EActivityCancellationReason.EXTRA_LINKS;
    }

    return this.validateAndSave(activity);
  }

  async validateAndSave(activity: Activity) {
    const errors = await validate(activity);

    // console.log(errors);

    if (errors.length) {
      throw new ConstraintsValidationException(errors);
    }

    return this.activityRepository.saveSingle(activity);
  }
}
