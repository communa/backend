import {inject, injectable} from 'inversify';
import {Activity} from '../../entity/Activity';

import {PaymentRepository} from '../../repository/PaymentRepository';
import {Payment} from '../../entity/Payment';
import {EPaymentState} from '../../interface/EPaymentState';

@injectable()
export class PaymentFixture {
  @inject('PaymentRepository')
  protected paymentRepository: PaymentRepository;

  public create(activity: Activity, amount: number, state: EPaymentState): Promise<Payment> {
    const payment = new Payment();

    payment.activity = activity;
    payment.amount = amount;
    payment.state = state;

    return this.paymentRepository.saveSingle(payment);
  }
}
