import faker from 'faker';
import {inject, injectable} from 'inversify';
import {Activity} from '../../entity/Activity';
import {User} from '../../entity/User';

import {ApplicationRepository} from '../../repository/ApplicationRepository';
import {Application} from '../../entity/Application';

@injectable()
export class ApplicationFixture {
  @inject('ApplicationRepository')
  protected applicationRepository: ApplicationRepository;

  public create(activity: Activity, user: User): Promise<Application> {
    const application = new Application();

    application.activity = activity;
    application.text = faker.datatype.uuid();
    application.rate = faker.datatype.number();
    application.user = user;

    return this.applicationRepository.saveSingle(application);
  }
}
