import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'Initialletters'})
export class GetInitial implements PipeTransform {
    transform(value :any): any  {
        return value.charAt(0);
    }
}