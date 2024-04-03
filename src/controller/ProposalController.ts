import {
  Body,
  Delete,
  HttpCode,
  JsonController,
  Post,
  Res,
  ResponseClassTransformOptions,
} from 'routing-controllers';

import {App} from '../app/App';
import {User} from '../entity/User';
import {AbstractController} from './AbstractController';
import {CurrentUser} from '../decorator/CurrentUser';
import {ProposalManager} from '../service/ProposalManager';
import {ProposalRepository} from '../repository/ProposalRepository';
import {Proposal} from '../entity/Proposal';
import {ProposalSearchDto} from '../validator/dto/ProposalSearchDto';
import {EntityFromParam} from '../decorator/EntityFromParam';
import {ActivityRepository} from '../repository/ActivityRepository';

@JsonController('/proposal')
export class ProposalController extends AbstractController {
  protected proposalManager: ProposalManager;
  protected proposalRepository: ProposalRepository;
  protected activityRepository: ActivityRepository;

  constructor() {
    super();

    this.proposalManager = App.container.get('ProposalManager');
    this.proposalRepository = App.container.get('ProposalRepository');
    this.activityRepository = App.container.get('ActivityRepository');
  }

  @Post('/search/business')
  @ResponseClassTransformOptions({groups: ['search']})
  public searchBusiness(@CurrentUser() currentUser: User, @Body() search: ProposalSearchDto) {
    return this.proposalRepository.findAndCountBusiness(search, currentUser);
  }

  @Post('/search/freelancer')
  @ResponseClassTransformOptions({groups: ['search']})
  public search(@CurrentUser() currentUser: User, @Body() search: ProposalSearchDto) {
    return this.proposalRepository.findAndCountFreelancer(search, currentUser);
  }

  @Post()
  @HttpCode(201)
  public async create(
    @CurrentUser() currentUser: User,
    @Body({validate: {groups: ['create']}, transform: {groups: ['create']}}) data: Proposal,
    @Res() res: any
  ) {
    data.user = currentUser;

    const proposal = await this.proposalManager.save(data);

    res.status(201);
    res.location(`/api/proposal/${proposal.id}`);

    return {};
  }

  @Delete('/:id')
  @HttpCode(200)
  public async delete(@CurrentUser() currentUser: User, @EntityFromParam('id') proposal: Proposal) {
    await this.proposalRepository.delete({
      id: proposal.id,
      user: currentUser,
    });

    return {};
  }
}
