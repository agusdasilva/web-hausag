import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ThemeService, ThemeMode } from '../../services/theme.service';
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
  isHomePage = false;
  scrollY = 0;

  private themeSub: Subscription | undefined;
  private routerSub: Subscription | undefined;

  constructor(
    public cartService: CartService,
    private themeService: ThemeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.theme = t;
      this.cdr.detectChanges();
    });

    // Detectar si estamos en home al inicio y en cada navegación
    this.isHomePage = this.router.url === '/';
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isHomePage = e.urlAfterRedirects === '/';
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.themeSub) this.themeSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.scrollY = window.scrollY;
    this.cdr.detectChanges();
  }

  /** Opacidad del fondo: 0 en el top, 1 al llegar a 400px de scroll */
  get headerBgOpacity(): number {
    if (!this.isHomePage) return 1;
    return Math.min(this.scrollY / 400, 1);
  }

  /** Estilo inline del header para transición suave */
  get headerStyle(): object {
    const op = this.headerBgOpacity;
    return {
      'background-color': `rgba(0, 0, 0, ${op * 0.80})`,
      'backdrop-filter': op > 0 ? `blur(${op * 12}px)` : 'none',
      '-webkit-backdrop-filter': op > 0 ? `blur(${op * 12}px)` : 'none',
      'border-bottom-color': `rgba(255, 255, 255, ${op * 0.20})`,
      'box-shadow': op > 0.3 ? `0 4px 30px rgba(0,0,0,${op * 0.5})` : 'none',
    };
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}

