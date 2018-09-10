
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'changeFormat'})
export class ChangeFormat implements PipeTransform {
    transform(value :any): any  {
        let date = new Date(value).getFullYear()+"-"+((new Date(value).getMonth() +1).toString().length == 1? ("0"+(new Date(value).getMonth() +1)) : (new Date(value).getMonth() +1))+"-"+(new Date(value).getDate().toString().length == 1? ("0"+new Date(value).getDate()) : new Date(value).getDate());
        return date;
    }
}