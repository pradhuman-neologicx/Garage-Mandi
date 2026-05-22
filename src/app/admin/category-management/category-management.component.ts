import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  icon?: string;
  itemCount: number;
  vehicleCategory?: string;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss'
})
export class CategoryManagementComponent {
  activeTab = signal<'vehicle' | 'spare'>('vehicle');

  vehicleCategories = signal<CategoryItem[]>([
    { id: 1, name: '2-Wheeler', description: 'Motorcycles and scooters', status: 'Active', icon: 'motorcycle', itemCount: 120 },
    { id: 2, name: '3-Wheeler', description: 'Auto rickshaws and trikes', status: 'Active', icon: 'electric_rickshaw', itemCount: 45 },
    { id: 3, name: '4-Wheeler', description: 'Cars and SUVs', status: 'Active', icon: 'directions_car', itemCount: 350 },
    { id: 4, name: 'Trucks', description: 'Commercial heavy vehicles', status: 'Active', icon: 'local_shipping', itemCount: 80 },
  ]);

  sparePartCategories = signal<CategoryItem[]>([
    { id: 1, name: 'Bumpers', description: 'Front and rear bumpers', status: 'Active', icon: 'directions_car', itemCount: 15 },
    { id: 2, name: 'Brakes', description: 'Brake pads, rotors, and calipers', status: 'Active', icon: 'album', itemCount: 85 },
    { id: 3, name: 'Filters', description: 'Oil, air, and cabin filters', status: 'Active', icon: 'filter_list', itemCount: 120 },
    { id: 4, name: 'Lighting', description: 'Headlights, taillights, and bulbs', status: 'Active', icon: 'highlight', itemCount: 64 },
  ]);

  showModal = signal(false);
  editingCategory = signal<CategoryItem | null>(null);

  newCategory: Partial<CategoryItem> = {
    name: '',
    description: '',
    status: 'Active',
    itemCount: 0,
    vehicleCategory: ''
  };

  switchTab(tab: 'vehicle' | 'spare') {
    this.activeTab.set(tab);
  }

  getCurrentList() {
    switch (this.activeTab()) {
      case 'vehicle': return this.vehicleCategories();
      case 'spare': return this.sparePartCategories();
    }
  }

  openAddModal() {
    this.editingCategory.set(null);
    this.newCategory = { name: '', description: '', status: 'Active', itemCount: 0, icon: 'category', vehicleCategory: '' };
    this.showModal.set(true);
  }

  openEditModal(category: CategoryItem) {
    this.editingCategory.set(category);
    this.newCategory = { ...category };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveCategory() {
    if (!this.newCategory.name) return;

    const listToUpdate = this.activeTab() === 'vehicle' ? this.vehicleCategories :
                         this.sparePartCategories;

    const currentList = listToUpdate();

    if (this.editingCategory()) {
      const updatedList = currentList.map(c => 
        c.id === this.editingCategory()?.id ? { ...c, ...this.newCategory } as CategoryItem : c
      );
      listToUpdate.set(updatedList);
    } else {
      const newId = currentList.length > 0 ? Math.max(...currentList.map(c => c.id)) + 1 : 1;
      const categoryToAdd = { ...this.newCategory, id: newId } as CategoryItem;
      listToUpdate.set([...currentList, categoryToAdd]);
    }

    this.closeModal();
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      const listToUpdate = this.activeTab() === 'vehicle' ? this.vehicleCategories :
                           this.sparePartCategories;
      
      listToUpdate.set(listToUpdate().filter(c => c.id !== id));
    }
  }

  toggleStatus(item: CategoryItem) {
    const listToUpdate = this.activeTab() === 'vehicle' ? this.vehicleCategories :
                         this.sparePartCategories;
                         
    const currentList = listToUpdate();
    const updatedList = currentList.map(c => 
      c.id === item.id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } as CategoryItem : c
    );
    listToUpdate.set(updatedList);
  }
}
