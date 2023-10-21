import {
  Authorized,
  Body,
  HttpCode,
  JsonController,
  Post,
  Res,
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

  @Post()
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(201)
  public async create(
    @CurrentUser() currentUser: User,
    @Body({validate: {groups: ['create']}, transform: {groups: ['create']}}) data: Payment,
    @Res() res: any
  ) {
    data.user = currentUser;

    const payment = await this.paymentManager.save(data);

    res.status(201);
    res.location(`/api/payment/${payment.id}`);

    return {};
  }
}
