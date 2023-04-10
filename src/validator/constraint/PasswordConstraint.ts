import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'PasswordConstraint', async: true})
export class PasswordConstraint implements ValidatorConstraintInterface {
  private message: string;

  validate(value: string) {
    if (!value) {
      return true;
    }

    const mask =
      /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=`\-\?;,./{}|\":<>\[\]\\\' ~_]).{8,}/;

    if (!mask.test(value)) {
      this.message =
        'Password should be at least 8 characters long containing at least 1 uppercase Letter, 1 number and 1 symbol';

      return false;
    }

    return true;
  }

  defaultMessage() {
    return this.message;
  }
}
