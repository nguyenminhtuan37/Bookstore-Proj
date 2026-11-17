import { Component, inject, input } from "@angular/core";
import { DataSync } from "../../../shared/services/update-data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductAction } from "../../../services/product.service";
import { VndPipe } from "../../../shared/pipes/currency.pipe";
import { ChinhSuaSp } from "../inventory/edit-ticket/edit-ticket.component";
import { ProductInfo } from "../../../shared/models/product.model";
import { CategorySync } from "../../../shared/services/update-data-categories.service";

@Component({
    selector: "product",
    styleUrls: ['../../../shared/styles/display.css'],
    templateUrl: "./products.html",
    imports: [VndPipe, ChinhSuaSp]
})
export class Product  {
  dataSync = inject(DataSync);
  private productAction = inject(ProductAction);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  productSync: ProductInfo[] = [];
  state: string = 'none';
  selectedItem: any;
  constructor() {
      this.route.queryParams.subscribe((params) => {
      const sort = params['sort'] || 'ten_sp';
      const sortDir = params['sortDir'] || 'asc';
      const search = params['search'];
      const filter = params['filter'];
      console.log("Custom ran")
      this.changeDisplay(sort, sortDir, search, filter);
    });
    this.router.navigate(['/products'], {
          queryParams: {
            sort: 'ten_sp',
            sortDir: 'asc'
          }
    });
  }
  addItem() {
    this.state = 'create';
  }
  // whats next?
  DeleteProduct(id: string): void {
    if(confirm("Chắc chắn xóa?")){
      this.productAction.deleteProduct(id);
      this.changeReact();
    }
  }
  EditProduct(id: string) {
    this.state = 'edit';
    this.productAction.selectProductForEdit(id);
  }
  displayConfig = {
    sortValue: 'ten_sp',
    sortDir: 'asc',
    searchTerm: '',
    filterBy: ''
  }

  changeDisplay(sort:string, sortDir:string, search:string, filter:string) {
        console.log('sortValue => ', sort);
        console.log('this.displayConfig.sortDir => ', this.displayConfig.sortDir);
        this.productSync = this.ArraySort(sort, sortDir);
        if(this.displayConfig.searchTerm) this.productSync = this.searchFunc(search);
        console.log(this.productSync);
        if(this.displayConfig.filterBy) this.productSync = this.filterByValue(filter);
        // console.log(this.productSync);
  }
  sortArray(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    console.log('Giá trị mới:', sort);
    this.displayConfig.sortValue = sort;
    this.router.navigate(['/products'], {
      queryParams: {sort},
      queryParamsHandling: 'merge', // Preserve other query parameters
    });
  }
  changeSortDir(event: Event) {
    const sortDir = (event.target as HTMLSelectElement).value;
    this.displayConfig.sortDir = sortDir;
    this.router.navigate(['/products'], {
      queryParams: {sortDir},
      queryParamsHandling: 'merge', // Preserve other query parameters
    });
  }
  searchItem(event: Event) {
    const search = (event.target as HTMLSelectElement).value;
    this.displayConfig.searchTerm = search;
    this.router.navigate(['/products'], {
      queryParams: {search},
      queryParamsHandling: 'merge', // Preserve other query parameters
    });
  }
  filterBy(event: Event) {
    const filter = (event.target as HTMLSelectElement).value;
    this.displayConfig.filterBy = filter;
    this.router.navigate(['/products'], {
      queryParams: {filter},
      queryParamsHandling: 'merge', // Preserve other query parameters
    });
  }
  changeReact() {
    this.changeDisplay(this.displayConfig.sortValue, this.displayConfig.sortDir, this.displayConfig.searchTerm, this.displayConfig.filterBy);
  }

  private _curData: ProductInfo[] = [];
  ArraySort(colName: string, order?: string): ProductInfo[] {
          this._curData = [...this.dataSync.state().Products ?? []];
          let curDataSort = this._curData?.sort((a, b) => {
              const value1 = a[colName as keyof ProductInfo];
              const value2 = b[colName as keyof ProductInfo];
              let cmp = 0;
              if (typeof value1 === "string" && typeof value2 === "string") {
                  cmp = value1.localeCompare(value2);
              }
              else if (typeof value1 === "number" && typeof value2 === "number") {
                  cmp = value1 < value2 ? 1 : (value1 > value2 ? -1 : 0);
              }
              return order === 'asc' ? cmp : -cmp;
          });
          // this.cateSync.demoCates.set({
          //     categoryList: curDataSort,
          // });
          this._curData = curDataSort;
          return this._curData;
  }
  searchFunc(value: string): ProductInfo[] {
          value?.normalize("NFC").toLowerCase();
          let searchItems = this._curData?.filter((item) => 
              item.ten_sp.normalize("NFC").toLowerCase().includes(value) ||
              item.danh_muc.normalize("NFC").toLowerCase().includes(value) ||
              item.id_sp.toLowerCase().includes(value)      
          );
          this._curData = searchItems;

          
          // this.cateSync.demoCates.set({
          //     categoryList: searchItems
          // });
          return this._curData;
  }
  filterByValue(value: string) {
    let curData: ProductInfo[] = [];
    console.log(this._curData)
    if (value === 'available') {
      curData = this._curData?.filter((item) =>  
        item.so_luong_ton > item.muc_ton_toi_thieu
      );
      this._curData = curData;
    }
    else if (value === 'notAvailable') {
      curData = this._curData?.filter((item) => 
        item.so_luong_ton <= item.muc_ton_toi_thieu
      );
      console.log("data now: ", curData)
      this._curData = curData;
    }
    else {
      console.log('Filter ran, but no value!')
    }
    return this._curData;
  }
}

      
