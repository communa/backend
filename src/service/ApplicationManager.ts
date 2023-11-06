import {inject, injectable} from 'inversify';

import {ApplicationRepository} from '../repository/ApplicationRepository';
import {Application} from '../entity/Application';

@injectable()
export class ApplicationManager {
  @inject('ApplicationRepository')
  protected applicationRepository: ApplicationRepository;

  public save(application: Application) {
    return this.applicationRepository.validateAndSave(application);
  }

  public async editAndSave(application: Application, data: Application) {
    application = Object.assign(application, data);

    await this.applicationRepository.validateAndSave(application);
  }
}
