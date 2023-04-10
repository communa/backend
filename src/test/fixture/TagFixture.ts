import faker from 'faker';
import {inject, injectable} from 'inversify';
import {getRepository} from 'typeorm';
import {Tag} from '../../entity/Tag';
import {TagFollowed} from '../../entity/TagFollowed';
import {User} from '../../entity/User';

import {TagRepository} from '../../repository/TagRepository';

@injectable()
export class TagFixture {
  @inject('TagRepository')
  protected tagRepository: TagRepository;

  public createTagFollowed(tag: Tag, user: User): Promise<TagFollowed> {
    const tagFollowed = new TagFollowed();

    tagFollowed.tag = tag;
    tagFollowed.user = user;

    return getRepository(TagFollowed).save(tagFollowed);
  }

  public createTag(): Promise<Tag> {
    const tag = new Tag();

    tag.name = faker.datatype.uuid();

    return this.tagRepository.saveSingle(tag);
  }
}
