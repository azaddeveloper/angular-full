import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'timeConvert'})
export class TimeConvert implements PipeTransform {
    transform(value :any): any  {
		let hours:any = (value / 60);
			hours = parseInt(hours)
		let minutes:any  = (value - (parseInt(hours) * 60));
        if(hours == '0' && minutes == '0'){
			return '0m';
		} else if(hours != '0' && minutes == '0'){
			return hours+'h';
		} else if(hours == '0' && minutes != '0'){
			return minutes+'m';
		} else {
			return hours+'h'+minutes+'m';
		}
    }
}