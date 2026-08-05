import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['Todos'];
  
  selectedCategory: string = 'Todos';
  searchTerm: string = '';
  loading = true;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Fetch all products once
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        
        // Extract unique categories, removing 'Accesorios'
        const uniqueCats = new Set(data.map(p => p.category).filter(c => c && c !== 'Accesorios'));
        this.categories = ['Todos', ...Array.from(uniqueCats).sort()];

        this.loading = false;
        
        // Listen to query params for pre-selection
        this.route.queryParams.subscribe(params => {
          if (params['category']) {
            this.selectedCategory = params['category'];
          } else {
            this.selectedCategory = 'Todos';
          }
          this.applyFilters();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let result = this.products;

    if (this.selectedCategory !== 'Todos') {
      if (this.selectedCategory === 'Griferías - Cocina') {
        result = result.filter(p => p.category === 'Griferías' && p.title.toLowerCase().includes('cocina'));
      } else if (this.selectedCategory === 'Griferías - Baño') {
        result = result.filter(p => p.category === 'Griferías' && p.title.toLowerCase().includes('baño'));
      } else {
        result = result.filter(p => p.category === this.selectedCategory);
      }
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(term) || 
        (p.sku && p.sku.toLowerCase().includes(term))
      );
    }

    this.filteredProducts = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }
}
