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
import {InvoiceManager} from '../service/InvoiceManager';
import {InvoiceRepository} from '../repository/InvoiceRepository';
import {InvoiceSearchDto} from '../validator/dto/InvoiceSearchDto';
import {Invoice} from '../entity/Invoice';
import {EntityFromParam} from '../decorator/EntityFromParam';

@JsonController('/invoice')
export class InvoiceController extends AbstractController {
  protected invoiceManager: InvoiceManager;
  protected invoiceRepository: InvoiceRepository;

  constructor() {
    super();

    this.invoiceManager = App.container.get('InvoiceManager');
    this.invoiceRepository = App.container.get('InvoiceRepository');
  }

  @Post('/search')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Invoice, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public search(@Body() search: InvoiceSearchDto) {
    return this.invoiceRepository.findAndCount(search);
  }

  @Get('/:id')
  @ResponseClassTransformOptions({groups: ['search']})
  public get(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id', null, {activity: true}) invoice: Invoice
  ) {
    return this.invoiceRepository.findOneConfirmUser(invoice, currentUser);
  }

  @Post('/:id/fullfill')
  public fullFill(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id', null, {activity: true}) invoice: Invoice
  ) {
    return this.invoiceRepository.findOneConfirmUser(invoice, currentUser);
  }
}
