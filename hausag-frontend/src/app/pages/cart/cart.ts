import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

import { ThemeService, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent implements OnInit, OnDestroy {
  theme: ThemeMode = 'dark';
  private themeSub: Subscription | undefined;

  constructor(public cartService: CartService, private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.theme = t;
    });
  }

  ngOnDestroy() {
    if (this.themeSub) this.themeSub.unsubscribe();
  }

  increaseQuantity(productId: number, currentQuantity: number) {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  decreaseQuantity(productId: number, currentQuantity: number) {
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
    }
  }

  onQuantityInput(productId: number, event: any) {
    let val = parseInt(event.target.value, 10);
    if (isNaN(val) || val < 1) {
      val = 1;
    }
    event.target.value = val;
    this.cartService.updateQuantity(productId, val);
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  requestQuote() {
    const items = this.cartService.items();
    if (items.length === 0) return;

    let text = 'Hola Hausag, quisiera solicitar un presupuesto por los siguientes artículos:%0A%0A';
    items.forEach(item => {
      text += `- ${item.quantity}x ${item.product.title} (SKU: ${item.product.sku})%0A`;
    });
    
    const phone = '5492236348144'; // Número actualizado
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
  }
}
