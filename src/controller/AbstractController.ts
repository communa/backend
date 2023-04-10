import {validate, ValidationError} from 'class-validator';
import {plainToClass, ClassTransformOptions} from 'class-transformer';

import {IPayloadDto} from '../interface/IPayloadDto';
import ConstraintsValidationException from '../exception/ConstraintsValidationException';

export abstract class AbstractController {
  async validateOrThrowErrors(dto: IPayloadDto) {
    const errors = await validate(dto);

    if (errors.length) {
      throw new ConstraintsValidationException(errors[0].children as ValidationError[]);
    }
  }

  public transform<D, S>(data: D, schema: {new (): S}, options: ClassTransformOptions = {}) {
    return plainToClass(schema, data, {
      excludeExtraneousValues: true,
      ...options,
    });
  }
}
