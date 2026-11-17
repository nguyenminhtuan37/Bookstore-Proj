import { Component, effect, inject, signal, model, output, input } from '@angular/core';

import { DataSync } from '../../../../shared/services/update-data.service';
import {form, FormField} from '@angular/forms/signals';
import { Constant } from '../../../../shared/constants/data-constants';
import { ProductAction } from '../../../../services/product.service';
import { ProductInfo } from '../../../../shared/models/product.model';
import { CategorySync } from '../../../../shared/services/update-data-categories.service';

const DEFAULT_FORM_MODEL: ProductInfo = {
  id_sp: '',
  ten_sp: '',
  danh_muc: '',
  don_vi_tinh: '',
  gia_nhap: 0,
  gia_ban: 0,
  so_luong_ton: 0,
  muc_ton_toi_thieu: 0,
  trang_thai: true,
}
@Component({
  selector: 'PhieuChinhSua',
  imports: [FormField],
  templateUrl: "./edit-ticket.html",
  styleUrls: ["./styles.css"],
})
export class ChinhSuaSp {
  dataSync = inject(DataSync);
  categorySync = inject(CategorySync)
  productAction = inject(ProductAction);
  formState = model<string>('none');
  selectedItem = input()
  changeStage = output();
  protected _curCates = this.categorySync.demoCates().categoryList ?? [];
  DVT = Constant.DVT;
  ProductModel = signal<ProductInfo>({
    id_sp: '',
    ten_sp: '',
    danh_muc: '',
    don_vi_tinh: 'viet nam dong',
    gia_nhap: 0,
    gia_ban: 0,
    so_luong_ton: 0,
    muc_ton_toi_thieu: 0,
    trang_thai: true,
});

  ProductForm = form(this.ProductModel);
  constructor () {
    // Sửa -> Model = selected; Tạo -> Mới
    effect(() => {
      const selected = this.productAction.selectedProduct();
      if (selected) {
        this.ProductModel.set({...selected});
      } else {
        this.resetForm();
      }
    })
  }

  updateProduct() {
    console.log('Data mới: ', this.ProductModel().id_sp);
    const productInfo = this.ProductModel();
    if (productInfo.ten_sp && productInfo.danh_muc && productInfo.gia_ban && productInfo.gia_nhap && productInfo.so_luong_ton) {
      // add it up
      if(this.formState() === 'edit') {
        // Chỉnh sửa
        this.productAction.updateProduct(this.ProductModel());
        this.formState.set('none');
        alert('Chỉnh sửa thành công');
        this.changeStage.emit();
      } else if (this.formState() === 'create') {
        // Thêm mới
        this.productAction.addProduct(this.ProductModel());
        this.formState.set('none');
        alert('Thêm mới thành công');
        this.changeStage.emit();
      }
    }
    else {
      alert("Thiếu trường sao");
    }
  }
  closePopup() {
    this.formState.set('none');
  }
  resetForm() {
    this.ProductModel.set({...DEFAULT_FORM_MODEL});
    this.productAction.clearSelection();
  }
  
}
