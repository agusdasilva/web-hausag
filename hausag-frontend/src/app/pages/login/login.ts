import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen pt-10 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center fade-in">
      <div class="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200 p-8 text-neutral-900">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-serif font-medium mb-2">Iniciar Sesión</h1>
          <p class="text-sm text-neutral-500">Ingresa a tu cuenta para gestionar tus preferencias.</p>
        </div>

        <div *ngIf="error" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-200 text-center">
          {{ error }}
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-neutral-700 mb-2">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
                   class="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all">
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-neutral-700 mb-2">Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" required
                   class="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all">
          </div>

          <button type="submit" [disabled]="loading"
                  class="w-full py-4 bg-neutral-900 text-white rounded-lg font-bold text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex justify-center items-center">
            <span *ngIf="!loading">Ingresar</span>
            <div *ngIf="loading" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-neutral-500">
          ¿No tienes una cuenta? <a routerLink="/registro" class="font-bold text-neutral-900 hover:underline">Regístrate aquí</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al iniciar sesión';
      }
    });
  }
}
