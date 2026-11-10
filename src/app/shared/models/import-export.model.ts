export enum ReceiptType {
  IMPORT = 'IMPORT', // Nhập kho
  EXPORT = 'EXPORT'  // Xuất kho
}
export interface ModelPhieu {
    id: number,
    type: string,
    dateCreated: Date,
    description: string,
}


export interface SanPham {
    id_sp: number,
    receiptType: {
        type: string,
        import: {
            gia_nhap: number,
            so_luong: number,
        },
        export: {
            gia_ban: number,
            so_luong: number,
        }
    }
}