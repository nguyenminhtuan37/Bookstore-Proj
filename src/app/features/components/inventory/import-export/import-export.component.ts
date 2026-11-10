import { Component, inject, signal } from "@angular/core";
import { LocalStorageService } from "../../../../shared/services/local-storage.service";
import { form, FormField, min, max, schema, hidden } from "@angular/forms/signals";
import { ProductInfo } from "../../../../shared/models/product.model";
import { DataSync } from "../../../../shared/services/update-data.service";
import { VndPipe } from "../../../../shared/pipes/currency.pipe";

export enum ReceiptType {
  IMPORT = 'IMPORT', // Nhập kho
  EXPORT = 'EXPORT'  // Xuất kho
}
export interface ReceiptInfo {
    id: number,
    type: string,
    dateCreated: Date,
    description: string,
}
export interface ProductFormModel {
    id_sp: number,
    don_gia: number,
    so_luong: number,
}


@Component({
    selector: 'phieuNhapXuat',
    templateUrl: './import-export.html',
    styleUrl: './styles.css',
    imports: [FormField, VndPipe],
})
export class phieuNhapXuat {
    // importClasses = signal(['btnTab']);
    // exportClasses = signal(['btnTab']);
    
    private localStorageService = inject(LocalStorageService);
    private dataSync = inject(DataSync);
    private products = this.dataSync.state().Products ?? [];
    receiptType = ReceiptType.IMPORT;
    protected AddedItems = [
        {
            id_sp: 0,
            so_luong: 0,
            don_gia: 0,
        }
    ];
    // saveDraft() {
    //     if (this.isImporting) this.localStorageService.setItem('Draft', this.AddedItems().displayItems ?? []);
    //     else this.localStorageService.setItem('Draft', this.AddedItems().displayItems ?? []);
    // }
    
    modelReceipt = signal<ProductFormModel>({
        id_sp: 0,
        don_gia: 0,
        so_luong: 0,
    });
    formReceipt = form(this.modelReceipt);
    // formReceipt = form(this.modelReceipt, (schemaPath) => {
    //     min(schemaPath.receiptType.import.gia_nhap, 0, {message: "Giá nhập phải hơn không!"});
    //     min(schemaPath.receiptType.import.so_luong, 0, {message: "Số lượng phải hơn không!"});
        
    //     min(schemaPath.receiptType.export.so_luong, 0, {message: "Số lượng phải hơn không!"});
    //     min(schemaPath.receiptType.export.gia_ban, 0, {message: "Giá bán phải hơn không!"});
    //     max(schemaPath.receiptType.export.gia_ban, 18, {message: "Giá bán phải nhỏ hơn số lượng tồn!"})
    // });
    
    
    // maximumRequired(id_sp: number = 0) {
    //     const product = this.findProductById(id_sp);
    //     return product?.so_luong_ton - product?.muc_ton_toi_thieu;
    // }\
    importStyle = signal(['state-btn', 'import']);
    exportStyle = signal(['state-btn']);// exportStyle = signal(['state-btn', 'export']);
    importActive: boolean = true;
    exportActive: boolean = false;
    toImport() {
        this.receiptType = ReceiptType.IMPORT;
        this.importActive = true;
        this.exportActive = false;
        // Sửa
    }
    toExport() {
        this.receiptType = ReceiptType.EXPORT;
        this.importActive = false;
        this.exportActive = true;
    }
    deleteItem(row: any) {
        // this.AddedItems.set({
        //     displayItems: this.curData?.filter((item) => item.id_sp === row.id_sp)
        // });
        if (confirm('Chắc chắn xóa?')) {
            this.AddedItems = this.AddedItems?.filter((item) => item.id_sp !== row.id_sp);
        }
    }
    AddItems(): void {
        // invalid
        if (this.modelReceipt().id_sp <= 0 || this.modelReceipt().so_luong <= 0 || this.modelReceipt().don_gia <= 0) {
            alert("Invalid field error")
        }
        else {
            console.log('data: ', this.products)
            alert('Item added!');
            this.AddedItems = [...this.AddedItems, this.modelReceipt()];
        }
    }
    
    findProductById(searchId: number): void {
        if (isNaN(searchId) || searchId <= 0) {
            alert('Invalid search!');
        }
        else {
            const foundItem = this.products.find((product) => product.id_sp === searchId);
            if (foundItem === undefined) {
                alert('Unable to find Product!');
            }
            else {
                if (this.receiptType === ReceiptType.EXPORT) {
                    // Xuất
                    this.modelReceipt.set({
                        ...this.modelReceipt(),
                        so_luong: foundItem.so_luong_ton,
                        don_gia: foundItem.gia_nhap
                    });
                }
                else {
                    // Nhập
                    this.modelReceipt.set({
                        ...this.modelReceipt(),
                        so_luong: 1,
                        don_gia: foundItem.gia_ban
                    })
                }
            }
        }
    }
    updateRowTotal(row: any): number {
        const qty = row.so_luong;
        const price = row.don_gia;
        return qty*price;
    }
    getGrandTotal(): number {
        return this.AddedItems.reduce((acc, item) => {
            const qty = item.so_luong;
            const price = item.don_gia;
            return acc + (qty*price);
        }, 0)
    }
    
    updateData() {
        // up lên localStorage
        
    }
    deleteAll() {
        if (confirm("Are you sure? Delete is permanent")) {
            this.AddedItems = [];
        }
    }
}