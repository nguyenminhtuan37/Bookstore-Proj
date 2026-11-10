import { Pipe, PipeTransform } from "@angular/core";
import { Constant } from "../constants/data-constants";

// @Pipe({
//     name: 'currencyByChoice'
// })
// export class CurrencyByChoice implements PipeTransform {
//     transform(value: number, choice: string): string {
//         const curSymbols = new Map<string, string>();
//         curSymbols.set(Constant.DVT.VND, "đ");
//         curSymbols.set(Constant.DVT.USD, "đô la Mỹ");
//         curSymbols.set(Constant.DVT.JPY, "yên Nhật");
//         curSymbols.set(Constant.DVT.EUR, "euro Âu")
//         // Thêm dấu phẩy
//         let valString: String = "";
//         while (value !== 0) {
//             const remain = value % 1000;
//             if (0 < remain && remain < 9) {
//                 valString += ","
//             }
//             valString += String(Math.floor(value / 1000)) + "," + String(value % 1000);

//         }
//         return valString + " " + curSymbols.get(choice);
//     }
// }

@Pipe({
  name: 'vnd',
  standalone: true
})
export class VndPipe implements PipeTransform {
  private formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0 // VND không dùng số thập phân
  });

  transform(value: number | string | null | undefined, fallback: string = '0 ₫'): string {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    const num = Number(value);
    if (isNaN(num)) {
      return fallback;
    }

    return this.formatter.format(num);
  }
}