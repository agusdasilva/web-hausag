import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { ThemeService, ThemeMode } from './services/theme.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  theme: ThemeMode = 'dark';
  hasHeroBanner = false;
  private routerSub: Subscription | undefined;
  private themeSub: Subscription | undefined;

  constructor(private router: Router, private themeService: ThemeService) {}

  private checkHeroBanner(url: string): boolean {
    const cleanUrl = url ? url.split('?')[0] : '';
    return cleanUrl === '/' || cleanUrl === '/catalogo';
  }

  ngOnInit() {
    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.theme = t;
    });

    this.hasHeroBanner = this.checkHeroBanner(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.hasHeroBanner = this.checkHeroBanner(e.urlAfterRedirects || e.url);
    });
  }

  ngOnDestroy() {
    if (this.themeSub) this.themeSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
  }
}
