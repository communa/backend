import {inject, injectable} from 'inversify';

import {Payment} from '../entity/Payment';
import {PaymentRepository} from '../repository/PaymentRepository';

@injectable()
export class PaymentManager {
  @inject('TimeRepository')
  protected paymentRepository: PaymentRepository;

  public async save(payment: Payment) {
    return this.paymentRepository.validateAndSave(payment);
  }
}
