import {
  Authorized,
  Body,
  Get,
  JsonController,
  Post,
  ResponseClassTransformOptions,
} from 'routing-controllers';

import {App} from '../app/App';
import {User} from '../entity/User';
import {ExtendedResponseSchema} from '../decorator/ExtendedResponseSchema';
import {EUserRole} from '../interface/EUserRole';
import {AbstractController} from './AbstractController';
import {CurrentUser} from '../decorator/CurrentUser';
import {PaymentManager} from '../service/PaymentManager';
import {PaymentRepository} from '../repository/PaymentRepository';
import {PaymentSearchDto} from '../validator/dto/PaymentSearchDto';
import {Payment} from '../entity/Payment';
import {EntityFromParam} from '../decorator/EntityFromParam';

@JsonController('/payment')
export class PaymentController extends AbstractController {
  protected paymentManager: PaymentManager;
  protected paymentRepository: PaymentRepository;

  constructor() {
    super();

    this.paymentManager = App.container.get('PaymentManager');
    this.paymentRepository = App.container.get('PaymentRepository');
  }

  @Post('/search')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Payment, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public search(@Body() search: PaymentSearchDto) {
    return this.paymentRepository.findAndCount(search);
  }

  @Get('/:id')
  @ResponseClassTransformOptions({groups: ['search']})
  public get(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id', null, {activity: true}) payment: Payment
  ) {
    return this.paymentRepository.findOneConfirmUser(payment, currentUser);
  }

  @Post('/:id/fullfill')
  public fullFill(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id', null, {activity: true}) payment: Payment
  ) {
    return this.paymentRepository.findOneConfirmUser(payment, currentUser);
  }
}
