import {inject, injectable} from 'inversify';
import {DeleteResult, getRepository} from 'typeorm';

import {Tag} from '../entity/Tag';
import {TagFollowed} from '../entity/TagFollowed';
import {User} from '../entity/User';
import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';

@injectable()
export class TagRepository extends AbstractRepositoryTemplate<Tag> {
  protected target = Tag;
  @inject('Filter')
  protected filter: Filter;

  public follow(tag: Tag, user: User): Promise<TagFollowed> {
    const tagFollowed = new TagFollowed();

    tagFollowed.tag = tag;
    tagFollowed.user = user;

    return this.getRepo().save(tagFollowed);
  }

  public unFollow(tag: Tag, user: User): Promise<DeleteResult> {
    return getRepository(TagFollowed)
      .createQueryBuilder('tagFollowed')
      .leftJoinAndSelect('tagFollowed.tag', 'tag')
      .leftJoinAndSelect('tagFollowed.user', 'user')
      .delete()
      .where('tag.id = :tagId', {tagId: tag.id})
      .andWhere('user.id = :userId', {userId: user.id})
      .execute();
  }
}
