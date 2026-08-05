import { Injectable, computed, signal } from '@angular/core';
import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSignal = signal<CartItem[]>(this.loadCartFromLocalStorage());

  totalItems = computed(() => {
    return this.cartItemsSignal().reduce((acc, item) => acc + item.quantity, 0);
  });

  items = computed(() => this.cartItemsSignal());

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'hausag_cart') {
        this.cartItemsSignal.set(this.loadCartFromLocalStorage());
      }
    });
  }

  private loadCartFromLocalStorage(): CartItem[] {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('hausag_cart');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  }

  private saveCartToLocalStorage(items: CartItem[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hausag_cart', JSON.stringify(items));
    }
  }

  addToCart(product: Product, quantity: number = 1) {
    this.cartItemsSignal.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      let newItems;
      if (existing) {
        newItems = items.map(i => 
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        newItems = [...items, { product, quantity }];
      }
      this.saveCartToLocalStorage(newItems);
      return newItems;
    });
  }

  removeFromCart(productId: number) {
    this.cartItemsSignal.update(items => {
      const newItems = items.filter(i => i.product.id !== productId);
      this.saveCartToLocalStorage(newItems);
      return newItems;
    });
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.cartItemsSignal.update(items => {
      const newItems = items.map(i => 
        i.product.id === productId ? { ...i, quantity } : i
      );
      this.saveCartToLocalStorage(newItems);
      return newItems;
    });
  }

  clearCart() {
    this.cartItemsSignal.set([]);
    this.saveCartToLocalStorage([]);
  }
}
