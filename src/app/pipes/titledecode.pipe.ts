import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'titleDecode'})
export class TitleDecode implements PipeTransform {
    transform(value :any): any  {
       return (value);
    }
}