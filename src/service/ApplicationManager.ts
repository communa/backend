import {inject, injectable} from 'inversify';

import {ApplicationRepository} from '../repository/ApplicationRepository';
import {Application} from '../entity/Application';

@injectable()
export class ApplicationManager {
  @inject('ApplicationRepository')
  protected applicationRepository: ApplicationRepository;

  public async save(time: Application) {
    return this.applicationRepository.validateAndSave(time);
  }
}
