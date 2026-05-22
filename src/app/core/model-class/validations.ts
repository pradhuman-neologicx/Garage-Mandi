import { AbstractControl, ValidationErrors } from "@angular/forms";

export class Validations {
 
  readonly email_pattern = "^[A-Za-z0-9_.]+@[a-zA-Z]+\\.[a-zA-Z]{2,4}$";
  readonly gst_pattern = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$";
  readonly msme_pattern = "^[A-Z]{2}[0-9]{2}[A-Z][0-9]{7}$";
  readonly inc_pattern = "^[A-Z][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$";
  readonly mobile_pattern = "^[6-9][0-9]{9}$";
  // readonly text_pattern = "[a-zA-Z!@#$%^*_ |]{2,}";
  readonly text_pattern = "^[a-zA-Z_ ]+(\\.[a-zA-Z_ \\.]+)*$"
  
  // readonly text_pattern = "[a-zA-Z!@#$%^*_.|]{2,}";

  readonly text_pattern_grade = "[a-zA-Z!@#$%^*_ |]";
  readonly pin_pattern = "/^0*[0-9]{6}$/";
  readonly year_pattern = "^[0-9]{4}$";
  readonly std_pattern = "^[0-9]{3}$";
  readonly passcode_pattern = "^[0-9]{8}$";
  readonly code = "^[A-Z]{2,3}$";
  readonly pan = "^([a-zA-Z]{5})([0-9]{4})([a-zA-Z]{1})$";
  readonly password =
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,16}$";
    readonly courseName = "^[a-zA-Z]{1}[A-Za-z0-9_ ]*$";
    // readonly name = "^[a-zA-Z_ ]*$"; 
    readonly name = "^[a-zA-Z_ ]+(\\.[a-zA-Z_ \\.]+)*$";     
    readonly batchcode = "^[0-9]{2}[A-Za-z][0-9][A-Za-z0-9]*$"; 
    readonly numberpattern = "^[0-9]{1,3}$";
  public validate(control: AbstractControl): ValidationErrors | null {
    if (!this.isDate(control.value)) {
      return { value: true };
    }

    return null;
  }

  private isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  //Find invalid control in form to check
  findInvalidControls(formControl: any) {
    const invalid = [];
    const controls = formControl;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    console.log(invalid);
    return invalid;
  }
}
export class AgeValidator {
  static validate(control: AbstractControl): ValidationErrors | null {
    const dateOfBirth: Date = new Date(control.value);
    const currentDate: Date = new Date();
    const ageInMilliseconds: number = currentDate.getTime() - dateOfBirth.getTime();
    const ageInYears: number = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25); // Approximate calculation accounting for leap years

    if (isNaN(ageInYears)) {
      // Invalid date of birth
      return { ageInvalid: true };
    }

    if (ageInYears < 18) {
      // Age is less than 18
      return { ageInvalid: true };
    }

    return null; // Age is valid
  }
}


