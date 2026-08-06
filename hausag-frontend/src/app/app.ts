import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  hasHeroBanner = false;
  private routerSub: Subscription | undefined;

  constructor(private router: Router) {}

  private checkHeroBanner(url: string): boolean {
    const cleanUrl = url ? url.split('?')[0] : '';
    return cleanUrl === '/' || cleanUrl === '/catalogo';
  }

  ngOnInit() {
    this.hasHeroBanner = this.checkHeroBanner(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.hasHeroBanner = this.checkHeroBanner(e.urlAfterRedirects || e.url);
    });
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
  }
}
