import { Service, inject, signal, computed } from "@angular/core";
import { DataSync } from "../shared/services/update-data.service";
import { ProductInfo, ProductState } from "../shared/models/product.model";

@Service({})
export class ProductAction {
    private dataSync = inject(DataSync);
    readonly selectedProduct = signal<ProductInfo | null>(null);
    readonly products = computed(() => this.dataSync.state().Products ?? []);

    getProductById(id_sp: string): ProductInfo | undefined {
        return this.products().find((product: ProductInfo) => product.id_sp === id_sp);
    }

    addProduct(newProduct: Omit<ProductInfo, 'id_sp'> & { id_sp?: string }): void {
        const currentProducts = this.products();
        const id = crypto.randomUUID();
        const itemToAdd: ProductInfo = {
            ...newProduct,
            id_sp: id,
        }
        
        this.dataSync.state.set({
            ...this.dataSync.state(),
            Products: [...currentProducts, itemToAdd],
        });
    }
    updateProduct(updatedProduct: ProductInfo): void {
        const currentProducts = this.products();
        const updatedList = currentProducts.map((item) =>
            item.id_sp === updatedProduct.id_sp ? { ...updatedProduct } : item
        );

        this.dataSync.state.set({
            ...this.dataSync.state(),
            Products: updatedList,
        });

        // Reset trạng thái đang chọn sau khi sửa xong
        if (this.selectedProduct()?.id_sp === updatedProduct.id_sp) {
            this.selectedProduct.set(null);
        }
    }
    deleteProduct(id_sp: string): void {
        const currentProducts = this.products();
        const filteredList = currentProducts.filter((item) => item.id_sp !== id_sp);
        this.dataSync.state.set({
            ...this.dataSync.state(),
            Products: filteredList,
        });

    }
    selectProductForEdit(id_sp: string): void {
        const foundItem = this.getProductById(id_sp);
        if (foundItem) {
            this.selectedProduct.set({ ...foundItem });
        }
    }

  /**
   * Hủy trạng thái chỉnh sửa / Reset form
   */
    clearSelection(): void {
        this.selectedProduct.set(null);
    }

  /**
   * Tự động sinh ID mới dựa trên ID lớn nhất hiện tại
   */
//   private generateNewId(products: ProductInfo[]): number {
//     if (!products || products.length === 0) return 1000;
//     const maxId = Math.max(...products.map((p) => p.id_sp));
//     return maxId + 1;
//   }
}