import faker from 'faker';
import {inject, injectable} from 'inversify';
import {Activity} from '../../entity/Activity';
import {User} from '../../entity/User';

import {PaymentRepository} from '../../repository/PaymentRepository';
import {Payment} from '../../entity/Payment';
import {EPaymentState} from '../../interface/EPaymentState';

@injectable()
export class PaymentFixture {
  @inject('PaymentRepository')
  protected paymentRepository: PaymentRepository;

  public create(activity: Activity, user: User, state: EPaymentState): Promise<Activity> {
    const payment = new Payment();

    payment.activity = activity;
    payment.user = user;
    payment.amount = faker.datatype.number();
    payment.state = state;

    return this.paymentRepository.saveSingle(activity);
  }
}
