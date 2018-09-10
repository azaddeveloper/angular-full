import {AbstractControl} from '@angular/forms';
export class PasswordMatchValidation {

    static MatchPassword(AC: AbstractControl) {
       let password = AC.get('new_password').value; // to get value in input tag
       let confirmPassword = AC.get('confirm_password').value; // to get value in input tag
        if(password != confirmPassword) {
            AC.get('confirm_password').setErrors( {MatchPassword: true} )
        } else {
            return null
        }
    }
}