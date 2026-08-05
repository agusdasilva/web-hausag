import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  increaseQuantity(productId: number, currentQuantity: number) {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  decreaseQuantity(productId: number, currentQuantity: number) {
    this.cartService.updateQuantity(productId, currentQuantity - 1);
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
    
    const phone = '5491112345678'; // Falso por ahora, se actualizará luego
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
  }
}
