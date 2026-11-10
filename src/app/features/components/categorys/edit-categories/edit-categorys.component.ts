import { Component, signal, inject, model, input, effect, output, computed } from "@angular/core";
import { category, categories } from "../../../../shared/models/category.model";
import { form, FormField } from "@angular/forms/signals";
import { LocalStorageService } from "../../../../shared/services/local-storage.service";
import { Constant } from "../../../../shared/constants/data-constants";
import { CategorySync } from "../../../../shared/services/update-data-categories.service";
import { CateAction } from "../../../../services/category.service";

const Default_Model: category = {
    name : '',
    id: 0,
    desc: ''
}

@Component({
    selector: 'editCategory',
    templateUrl: './edit-categorys.component.html',
    styleUrl: 'styles.component.css',
    imports: [FormField]
})
export class editCategory {
    isModeCreateOfPopup: boolean = false;
    categorySync = inject(CategorySync);
    cateList = computed(() => this.categorySync.demoCates().categoryList?.filter((item) => item.name));
    cateAction = inject(CateAction);
    popupState = model('none');
    localStorageService = inject(LocalStorageService);
    modelCategory = signal<category>({
        name : '',
        id: 0,
        desc: ''
    });
    formCategory = form(this.modelCategory);
    // demoCates = this.localStorageService.getItem('categoriesData');
    

    eventSucess = output();
    constructor() {
        effect(() => {
            const selectedItem = this.selectItem();
            if(this.selectItem() && this.popupState() !== 'create'){
                this.modelCategory.set({
                    ...selectedItem as category
                });
            }
            else{
                this.modelCategory.set({...Default_Model})
            }
        })
    }
    
    onHandleCancel() {
        this.popupState.set('none');
        this.modelCategory.set({...Default_Model});
    }
    selectItem = input<category>();
    onHandleSave() {
        console.log("save obj", this.modelCategory());      
        if(this.popupState() === 'create'){
            console.log(this.modelCategory().name)
            const curList = this.categorySync.demoCates().categoryList?.map((item) => item.name);
            if (!this.modelCategory().name) {
                alert('Thiếu trường tên')
            }
            else if (curList?.includes(this.modelCategory().name)) {
                alert('Danh mục bị trùng')
            }
            else {
                // Lưu chỉ khi trường name ko trống
                // ĐK thứ 2: không có lặp
                
                this.cateAction.addItem(this.modelCategory());
                this.popupState.set('none');
                alert('Thêm mới thành công!');
                this.eventSucess.emit();
            }
        }
        else if (this.popupState() === 'update'){
            console.log('selectItem: ', this.selectItem())
            // Chỉnh sửa
            this.cateAction.updateItem(this.modelCategory());
            this.popupState.set('none');
            alert('chỉnh sửa thành công!');
            this.eventSucess.emit();
        }
    }
    generateNewId(categories: category[]): number {
        if (!categories || categories.length === 0) return 1000;
        const maxId = Math.max(...categories.map((p) => p.id));
        return maxId + 1;
    }
    
}