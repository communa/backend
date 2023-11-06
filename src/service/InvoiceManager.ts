import {inject, injectable} from 'inversify';

import {Invoice} from '../entity/Invoice';
import {InvoiceRepository} from '../repository/InvoiceRepository';

@injectable()
export class InvoiceManager {
  @inject('TimeRepository')
  protected invoiceRepository: InvoiceRepository;

  public async save(invoice: Invoice) {
    return this.invoiceRepository.validateAndSave(invoice);
  }
}
