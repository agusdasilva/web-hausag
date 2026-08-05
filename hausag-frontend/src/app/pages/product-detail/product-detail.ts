import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product';
import { CartService } from '../../services/cart.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading: boolean = true;
  error: boolean = false;
  errorMessage: string = '';
  quantity: number = 1;
  show3D: boolean = false;
  addedMessage: boolean = false;
  
  // Theme state from service
  theme: 'dark' | 'light' = 'dark';
  private themeSub: any;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) {}

  get has3DModel(): boolean {
    if (!this.product) return false;
    // El modelo 3D solo está disponible para el producto 131 (HAUS-1027)
    return this.product.id === 131 || this.product.sku === 'HAUS-1027';
  }

  get model3DUrl(): string {
    return '/assets/models/HAUS-1027.glb';
  }

  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.theme = t;
      this.cdr.detectChanges();
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('ID from route:', id);
      this.show3D = false; // Resetear vista 3D al cambiar de producto
      
      if (id) {
        this.loading = true; // reset loading on route change
        this.productService.getProductById(id).subscribe({
          next: (data) => {
            console.log('Product data received:', data);
            this.product = data;
            
            // Fetch related products
            this.productService.getProducts(undefined, this.product.category).subscribe({
              next: (relatedData) => {
                this.relatedProducts = relatedData.filter(p => p.id !== this.product?.id).slice(0, 12);
                this.loading = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: (err) => {
            console.error('API Error:', err);
            this.error = true;
            this.errorMessage = err.message || 'Unknown error';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        console.error('No ID found in route!');
        this.error = true;
        this.errorMessage = 'ID de producto no válido en la URL';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  scrollCarousel(direction: 'left' | 'right') {
    const container = document.getElementById('related-carousel');
    if (container) {
      const scrollAmount = container.clientWidth;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        // If we are at the end, jump back to start
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.addedMessage = true;
      setTimeout(() => {
        this.addedMessage = false;
      }, 3000);
    }
  }

  getWhatsAppLink(): string {
    if (!this.product) return '';
    const phone = '5491112345678'; // Falso por ahora
    const text = encodeURIComponent(`Hola Hausag, quería consultar por el producto: ${this.product.title} (SKU: ${this.product.sku})`);
    return `https://wa.me/${phone}?text=${text}`;
  }
}
