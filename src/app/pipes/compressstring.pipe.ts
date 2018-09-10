import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'CompressWord'})
export class CompressString implements PipeTransform {
    transform(value :any): any  {
        if(value.length >15){
            var new_value = value.substring(0,8)+value.substring(value.lastIndexOf("."));

        }else{
            var new_value = value;
        }
        return new_value;
    }
}