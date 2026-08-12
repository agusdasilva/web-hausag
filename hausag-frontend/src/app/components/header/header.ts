import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { AuthService, User } from '../../services/auth';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  menuOpen = false;
  theme: ThemeMode = 'dark';
  hasHeroBanner = false;
  scrollY = 0;
  userMenuOpen = false;
  currentUser: User | null = null;

  private themeSub: Subscription | undefined;
  private routerSub: Subscription | undefined;
  private userSub: Subscription | undefined;

  constructor(
    public cartService: CartService,
    private themeService: ThemeService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  private checkHeroBanner(url: string): boolean {
    const cleanUrl = url ? url.split('?')[0] : '';
    return cleanUrl === '/' || cleanUrl === '/catalogo' || cleanUrl === '/nosotros';
  }

  ngOnInit() {
    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.theme = t;
      this.cdr.detectChanges();
    });

    this.userSub = this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.cdr.detectChanges();
    });

    // Detectar si estamos en una página con hero banner al inicio y en cada navegación
    this.hasHeroBanner = this.checkHeroBanner(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.hasHeroBanner = this.checkHeroBanner(e.urlAfterRedirects || e.url);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.themeSub) this.themeSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.userSub) this.userSub.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.scrollY = window.scrollY;
    this.cdr.detectChanges();
  }

  /** Opacidad del fondo: 0 en el top, 1 al llegar a 150px de scroll */
  get headerBgOpacity(): number {
    if (!this.hasHeroBanner) return 1;
    return Math.min(this.scrollY / 150, 1);
  }

  /** Determina el tema efectivo del header. Si está sobre un banner y transparente, fuerza dark */
  get effectiveTheme(): ThemeMode {
    if (this.hasHeroBanner && this.theme === 'light' && this.headerBgOpacity < 0.6) {
      return 'dark';
    }
    return this.theme;
  }

  get headerStyle(): object {
    const op = this.headerBgOpacity;
    const isLight = this.theme === 'light';
    const r = isLight ? 255 : 0;
    const g = isLight ? 255 : 0;
    const b = isLight ? 255 : 0;
    return {
      'background-color': `rgba(${r}, ${g}, ${b}, ${op})`,
      'backdrop-filter': op > 0 ? `blur(${op * 12}px)` : 'none',
      '-webkit-backdrop-filter': op > 0 ? `blur(${op * 12}px)` : 'none',
      'border-bottom-color': isLight ? `rgba(0, 0, 0, ${op * 0.1})` : `rgba(255, 255, 255, ${op * 0.15})`,
      'box-shadow': op > 0.3 ? `0 4px 30px rgba(0, 0, 0, ${isLight ? op * 0.05 : op * 0.7})` : 'none',
    };
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }
}

