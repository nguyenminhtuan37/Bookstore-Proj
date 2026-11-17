import { Component, inject, signal, computed } from "@angular/core";
import { LocalStorageService } from "../../../../shared/services/local-storage.service";
import { form, FormField, min, max, required } from "@angular/forms/signals";
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
    id_sp: string,
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
    receiptType = "IMPORT";
    protected AddedItems: ProductFormModel[] = [];
    protected PurchaseHistory: ReceiptInfo[] = [];
    // saveDraft() {
    //     if (this.isImporting) this.localStorageService.setItem('Draft', this.AddedItems().displayItems ?? []);
    //     else this.localStorageService.setItem('Draft', this.AddedItems().displayItems ?? []);
    // }
    // Tại sao phải để cho đúng?
    DEFAULT_RECEIPT: ProductFormModel = {
        id_sp: '',
        don_gia: 0,
        so_luong: 0,
    }
    modelReceipt = signal<ProductFormModel>({
        id_sp: '',
        don_gia: 0,
        so_luong: 0,
    });
    
    // formReceipt = form(this.modelReceipt);
    formReceipt = form(this.modelReceipt, (schemaPath) => {
        required(schemaPath.id_sp, {message: "Thiếu id"})
        min(schemaPath.don_gia, 0, {message: "Giá nhập phải hơn không!"});
        min(schemaPath.so_luong, 0, {message: "Số lượng phải hơn không!"});
        max(schemaPath.don_gia, this.productStock, {message: "Giá bán phải nhỏ hơn số lượng tồn!"})
    });
    // allFieldsFilled = computed(() => {
    //     return (
    //         this.modelReceipt().don_gia > 0 &&
    //         this.modelReceipt().so_luong > 0 &&
    //         this.modelReceipt().so_luong < this.productStock &&
    //         this.modelReceipt().id_sp !== ''
    //     );
    // })
    changeState(currentState: string) {
        if (currentState !== this.receiptType) {
            this.receiptType = currentState;
            this.modelReceipt.set({
                ...this.DEFAULT_RECEIPT
            });
            this.AddedItems = [];
        }
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
        if (this.modelReceipt().id_sp === '' || this.modelReceipt().so_luong <= 0 || this.modelReceipt().don_gia <= 0) {
            alert("Invalid field error");
        }
        else {
            const index = this.AddedItems.findIndex(i => i.id_sp === this.modelReceipt().id_sp && i.don_gia === this.modelReceipt().don_gia);
            // Nếu sản phẩm tồn tại -> update
            if (index > -1) {
                const updated = [...this.AddedItems];
                // update luông
                updated[index].so_luong += this.modelReceipt().so_luong;
                console.log('số lượng: ', this.AddedItems[index].so_luong);

                this.modelReceipt.set({
                    ...this.DEFAULT_RECEIPT
                });
            }
            else {
                console.log('data: ', this.products);
                this.AddedItems = [...this.AddedItems, this.modelReceipt()];
                this.modelReceipt.set({
                    ...this.DEFAULT_RECEIPT
                });
            }
            console.log(this.AddedItems);
            
        }
    }

    // findProductById(searchId: number): void {
    //     if (isNaN(searchId) || searchId <= 0) {
    //         alert('Invalid search!');
    //     }
    //     else {
    //         const foundItem = this.products.find((product) => product.id_sp === searchId);
    //         if (foundItem === undefined) {
    //             alert('Unable to find Product!');
    //         }
    //         else {
    //             if (this.receiptType === ReceiptType.EXPORT) {
    //                 // Xuất
    //                 this.modelReceipt.set({
    //                     ...this.modelReceipt(),
    //                     so_luong: foundItem.so_luong_ton,
    //                     don_gia: foundItem.gia_nhap
    //                 });
    //             }
    //             else {
    //                 // Nhập
    //                 this.modelReceipt.set({
    //                     ...this.modelReceipt(),
    //                     so_luong: 1,
    //                     don_gia: foundItem.gia_ban
    //                 })
    //             }
    //         }
    //     }
    // }
    findProductById(searchId: string): ProductInfo | undefined {
        return this.products.find((product) => product.id_sp === searchId);
    }
    isDropdownOpen = signal<boolean>(false);
    productStock = 0
    chooseItem(product: any) {
        if (this.receiptType === ReceiptType.EXPORT) {
            // Xuất
            this.modelReceipt.set({
                ...this.modelReceipt(),
                id_sp: product.id_sp,
                don_gia: product.gia_nhap
            });
            this.productStock = product.so_luong_ton;
        }
        else {
            // Nhập
            this.modelReceipt.set({
                ...this.modelReceipt(),
                id_sp: product.id_sp,
                don_gia: product.gia_nhap
            });
        }
        this.productOptions = [];
        this.isDropdownOpen.set(false);
    }

    // Upgrade
    productOptions: ProductInfo[] = [];
    findProducts(value: Event): void {
        const target = (value.target as HTMLSelectElement).value;
        this.productOptions = this.products?.filter(item => {
            let matchesStr = item.ten_sp.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
            let normalizedSearch = target.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
            const StrMatches = matchesStr.toLowerCase().includes(normalizedSearch);

            const NumMatches = item.id_sp.startsWith(target);
            return NumMatches || StrMatches;
        });
        console.log(this.productOptions);
        this.isDropdownOpen.set(true);
    }
    // openDropdown() {
    //     this.isDropdownOpen.set(true);
    // }
    // closeDropdown() {
    //     this.isDropdownOpen.set(false);
    // }
    updateRowTotal(row: any): number {
        const qty = row.so_luong;
        const price = row.don_gia;
        return qty * price;
    }
    getGrandTotal(): number {
        return this.AddedItems.reduce((acc, item) => {
            const qty = item.so_luong;
            const price = item.don_gia;
            return acc + (qty * price);
        }, 0)
    }
    updateData() {
        // up lên localStorage và lưu vào lịch sử
        if (this.AddedItems.length === 0) {
            alert('Bảng nhập/ xuất trống. Không thể lưu')
        }
        else {
            // Nhập
            if (this.receiptType === ReceiptType.IMPORT) {
                for (let item of this.AddedItems) {
                    console.log("id sp: ", item.id_sp);
                    const index = this.products.findIndex((product) => product.id_sp === item.id_sp);
                    // const foundProduct = this.products.find((product) => product.id_sp === item.id_sp);

                    // console.log('sp tìm được: ', foundProduct);
                    // console.log('vị trí sp tìm được: ', index);
                    // console.log('data now: ', this.products);
                    this.products[index].gia_nhap = item.don_gia;
                    this.products[index].so_luong_ton += item.so_luong;
                }
                console.log(this.products);
                this.dataSync.state.set({
                    Products: this.products
                });
            }
            // Xuất
            else {
                for (let item of this.AddedItems) {
                    const index = this.products.findIndex((product) => product.id_sp === item.id_sp);
                    this.products[index].gia_nhap = item.don_gia;
                    this.products[index].so_luong_ton -= item.so_luong;
                }
                console.log(this.products);
                this.dataSync.state.set({
                    Products: this.products
                });
            }
            this.AddedItems = [];
            // Update lịch sử giao dịch

        }
    }
    deleteAll() {
        if (confirm("Are you sure? Delete is permanent")) {
            this.AddedItems = [];
        }
    }

}
