import {inject, injectable} from 'inversify';

import {ProposalRepository} from '../repository/ProposalRepository';
import {Proposal} from '../entity/Proposal';

@injectable()
export class ProposalManager {
  @inject('ProposalRepository')
  protected proposalRepository: ProposalRepository;

  public save(proposal: Proposal) {
    return this.proposalRepository.validateAndSave(proposal);
  }

  public async editAndSave(proposal: Proposal, data: Proposal) {
    proposal = Object.assign(proposal, data);

    await this.proposalRepository.validateAndSave(proposal);
  }
}
