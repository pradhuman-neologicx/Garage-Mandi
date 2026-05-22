import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {

  transform(value: any): string {
    if (value > 999) {
      const formattedValue = value / 1000;
      return `${formattedValue}k`;
    } else {
      return value.toString();
    }
  }

}
