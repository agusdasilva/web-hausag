import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen pt-10 pb-16 px-4 sm:px-6 lg:px-8 fade-in" [ngClass]="themeService.currentTheme === 'light' ? 'text-black' : 'text-white'">
      <div class="max-w-6xl mx-auto">
        <div class="mb-10">
          <h1 class="text-4xl md:text-5xl font-serif font-medium mb-2">Mi Perfil</h1>
          <p class="opacity-70">Gestiona tus datos personales, seguridad y tarjetas.</p>
        </div>

        <div *ngIf="!user" class="text-center py-20">
          <div class="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>

        <div *ngIf="user" class="flex flex-col md:flex-row gap-8">
          
          <!-- Sidebar Nav -->
          <div class="w-full md:w-64 flex-shrink-0">
            <nav class="flex flex-col space-y-1">
              <button (click)="activeTab = 'personal'" 
                      [ngClass]="activeTab === 'personal' 
                        ? (themeService.currentTheme === 'light' ? 'bg-black text-white' : 'bg-white text-black-pure')
                        : (themeService.currentTheme === 'light' ? 'text-black/70 hover:bg-black/5 hover:text-black' : 'text-white/70 hover:bg-white/10 hover:text-white')"
                      class="px-4 py-3 text-left rounded-lg text-sm font-bold uppercase tracking-widest transition-all">
                Datos Personales
              </button>
              <button (click)="activeTab = 'security'" 
                      [ngClass]="activeTab === 'security' 
                        ? (themeService.currentTheme === 'light' ? 'bg-black text-white' : 'bg-white text-black-pure')
                        : (themeService.currentTheme === 'light' ? 'text-black/70 hover:bg-black/5 hover:text-black' : 'text-white/70 hover:bg-white/10 hover:text-white')"
                      class="px-4 py-3 text-left rounded-lg text-sm font-bold uppercase tracking-widest transition-all">
                Seguridad
              </button>
              <!-- 
              <button (click)="activeTab = 'cards'" 
                      [ngClass]="activeTab === 'cards' 
                        ? (themeService.currentTheme === 'light' ? 'bg-black text-white' : 'bg-white text-black-pure')
                        : (themeService.currentTheme === 'light' ? 'text-black/70 hover:bg-black/5 hover:text-black' : 'text-white/70 hover:bg-white/10 hover:text-white')"
                      class="px-4 py-3 text-left rounded-lg text-sm font-bold uppercase tracking-widest transition-all">
                Mis Tarjetas
              </button>
              -->
            </nav>
          </div>

          <!-- Main Content Area -->
          <div class="flex-1">
            <div class="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 p-6 sm:p-10 text-neutral-900">
              
              <!-- Success/Error Messages -->
              <div *ngIf="message" class="bg-green-50 text-green-700 text-sm p-4 rounded-lg mb-6 border border-green-200">
                {{ message }}
              </div>
              <div *ngIf="error" class="bg-red-50 text-red-600 text-sm p-4 rounded-lg mb-6 border border-red-200">
                {{ error }}
              </div>

              <!-- DATOS PERSONALES -->
              <div *ngIf="activeTab === 'personal'" class="fade-in">
                <h2 class="text-2xl font-serif mb-6">Información Básica</h2>
                <form (ngSubmit)="updatePersonal()" class="space-y-6">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Nombre</label>
                      <input type="text" [(ngModel)]="formData.first_name" name="first_name" class="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black">
                    </div>
                    <div>
                      <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Apellido</label>
                      <input type="text" [(ngModel)]="formData.last_name" name="last_name" class="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Descripción (Opcional)</label>
                    <textarea [(ngModel)]="formData.description" name="description" rows="3" class="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black"></textarea>
                  </div>
                  <div class="pt-4 border-t border-neutral-100 flex justify-end">
                    <button type="submit" [disabled]="loading" class="px-8 py-3 bg-black text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all">
                      {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- SEGURIDAD -->
              <div *ngIf="activeTab === 'security'" class="fade-in">
                <h2 class="text-2xl font-serif mb-6">Seguridad y Acceso</h2>
                <form (ngSubmit)="updateSecurity()" class="space-y-6">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Correo Electrónico</label>
                    <input type="email" [(ngModel)]="formData.email" name="email" class="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black">
                  </div>
                  
                  <div class="pt-6 border-t border-neutral-100">
                    <h3 class="text-sm font-bold uppercase tracking-widest text-neutral-900 mb-4">Cambiar Contraseña</h3>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Contraseña Actual</label>
                        <input type="password" [(ngModel)]="formData.current_password" name="current_password" class="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black">
                      </div>
                      <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Nueva Contraseña</label>
                        <input type="password" [(ngModel)]="formData.new_password" name="new_password" class="w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black">
                      </div>
                    </div>
                  </div>

                  <div class="pt-4 border-t border-neutral-100 flex justify-end">
                    <button type="submit" [disabled]="loading" class="px-8 py-3 bg-black text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all">
                      {{ loading ? 'Actualizando...' : 'Actualizar Seguridad' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- TARJETAS (Oculto por ahora) -->
              <div *ngIf="false && activeTab === 'cards'" class="fade-in">
                <div class="flex justify-between items-end mb-6">
                  <h2 class="text-2xl font-serif">Mis Tarjetas</h2>
                  <button (click)="showCardForm = true" *ngIf="!showCardForm" class="text-xs font-bold uppercase tracking-widest text-black underline underline-offset-4 hover:text-neutral-600">
                    + Agregar Tarjeta
                  </button>
                </div>

                <div *ngIf="user.cards?.length === 0 && !showCardForm" class="text-center py-10 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                  <p class="text-sm text-neutral-500 mb-4">No tienes tarjetas guardadas.</p>
                </div>

                <div class="space-y-4 mb-8">
                  <div *ngFor="let card of user.cards" class="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-8 bg-neutral-900 rounded text-white flex items-center justify-center text-xs font-bold uppercase">
                        {{ card.card_brand }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-neutral-900">•••• •••• •••• {{ card.card_last_4 }}</p>
                        <p class="text-xs text-neutral-500">{{ card.name_on_card }}</p>
                      </div>
                    </div>
                    <button (click)="deleteCard(card.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar tarjeta">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                <!-- Formulario Agregar Tarjeta -->
                <div *ngIf="showCardForm" class="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
                  <h3 class="text-sm font-bold uppercase tracking-widest text-neutral-900 mb-4">Nueva Tarjeta</h3>
                  <form (ngSubmit)="addCard()" class="space-y-4">
                    <div>
                      <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Número de Tarjeta (16 dígitos)</label>
                      <input type="text" [(ngModel)]="newCard.card_number" name="card_number" required maxlength="16" class="w-full px-4 py-3 rounded-lg bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black">
                    </div>
                    <div>
                      <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Nombre como aparece en la tarjeta</label>
                      <input type="text" [(ngModel)]="newCard.name_on_card" name="name_on_card" required class="w-full px-4 py-3 rounded-lg bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black">
                    </div>
                    <p class="text-[10px] text-neutral-400 font-medium my-2">Por seguridad, solo almacenaremos los últimos 4 dígitos y la marca de la tarjeta.</p>
                    <div class="flex justify-end gap-3 pt-4">
                      <button type="button" (click)="showCardForm = false" class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors">Cancelar</button>
                      <button type="submit" [disabled]="loading" class="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-colors">Guardar</button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  activeTab: 'personal' | 'security' | 'cards' = 'personal';
  
  formData: any = {};
  newCard: any = {};
  showCardForm = false;
  
  message = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.formData = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          description: user.description || ''
        };
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  updatePersonal() {
    this.loading = true;
    this.message = ''; this.error = '';
    const payload = {
      first_name: this.formData.first_name,
      last_name: this.formData.last_name,
      description: this.formData.description
    };
    
    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Datos personales actualizados.';
        this.loadProfile();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al actualizar';
      }
    });
  }

  updateSecurity() {
    this.loading = true;
    this.message = ''; this.error = '';
    const payload = {
      email: this.formData.email,
      current_password: this.formData.current_password,
      new_password: this.formData.new_password
    };
    
    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Seguridad actualizada correctamente.';
        this.formData.current_password = '';
        this.formData.new_password = '';
        this.loadProfile();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al actualizar seguridad';
      }
    });
  }

  addCard() {
    if (!this.newCard.card_number || this.newCard.card_number.length < 13) {
      this.error = 'Ingrese un número de tarjeta válido';
      return;
    }
    
    this.loading = true;
    this.message = ''; this.error = '';
    
    this.authService.addCard(this.newCard).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Tarjeta agregada exitosamente.';
        this.showCardForm = false;
        this.newCard = {};
        this.loadProfile();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al agregar tarjeta';
      }
    });
  }

  deleteCard(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) return;
    
    this.authService.deleteCard(id).subscribe({
      next: () => {
        this.message = 'Tarjeta eliminada.';
        this.loadProfile();
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al eliminar tarjeta';
      }
    });
  }
}
