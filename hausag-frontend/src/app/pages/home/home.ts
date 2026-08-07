import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  theme: ThemeMode = 'dark';
  private themeSub: Subscription | undefined;
  currentSlide = 0;
  slideInterval: any;

  constructor(private themeService: ThemeService) {}

  featuredProducts = [
    {
      name: 'Grifería Niza – Oro Cepillado',
      category: 'Griferías de Cocina',
      image: '/assets/images/productos ambientados/HAUS-1027.jpg',
      link: '/catalogo/131',
      queryParams: {}
    },
    {
      name: 'Radiador 500mm · 6 Elementos',
      category: 'Calefacción',
      image: '/assets/images/productos ambientados/HAUS-1005.jpg',
      link: '/catalogo/109',
      queryParams: {}
    },
    {
      name: 'Grifería Riga – Cuello Profesional',
      category: 'Griferías de Cocina',
      image: '/assets/images/productos ambientados/HAUS-1024.jpg',
      link: '/catalogo/128',
      queryParams: {}
    },
    {
      name: 'Grifería Niza – Negro & Cobre',
      category: 'Griferías de Cocina',
      image: '/assets/images/productos ambientados/HAUS-1025.jpg',
      link: '/catalogo/129',
      queryParams: {}
    },
    {
      name: 'Grifería Lyon – Cromo Brillante',
      category: 'Griferías de Cocina',
      image: '/assets/images/productos ambientados/HAUS-1044.jpg',
      link: '/catalogo/148',
      queryParams: {}
    },
    {
      name: 'Toallero Radiador Cromado 77×45',
      category: 'Calefacción',
      image: '/assets/images/productos ambientados/TOALLERO-CR.jpg',
      link: '/catalogo/125',
      queryParams: {}
    },
    {
      name: 'Toallero Radiador Blanco 77×45',
      category: 'Calefacción',
      image: '/assets/images/productos ambientados/HAUS-1046.jpg',
      link: '/catalogo/150',
      queryParams: {}
    }
  ];

  slides = [
    {
      title: 'Explora Nuestro Catálogo',
      subtitle: 'Diseño exclusivo',
      description: 'Descubre nuestra línea completa de productos pensados para darle el toque final de elegancia a tu construcción o remodelación.',
      image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      link: '/catalogo',
      buttonText: 'Ver Catálogo Completo'
    },
    {
      title: 'Griferías de Vanguardia',
      subtitle: 'Para cocina y baño',
      description: 'Renueva tus espacios con nuestra colección de griferías. Estilos modernos, minimalistas y duraderos.',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      link: '/catalogo?category=Grifer%C3%ADa%20de%20Cocina',
      buttonText: 'Ver Griferías'
    },
    {
      title: 'Sistemas de Calefacción',
      subtitle: 'Confort en tu hogar',
      description: 'Mantén tus ambientes cálidos con equipos eficientes, seguros y diseñados para integrarse a tu decoración.',
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      link: '/catalogo?category=Calefacci%C3%B3n',
      buttonText: 'Ver Calefacción'
    }
  ];

  ngOnInit() {
    this.startCarousel();
    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.theme = t;
    });
  }

  ngOnDestroy() {
    this.stopCarousel();
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }

  startCarousel() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  stopCarousel() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    // Reset interval when user interacts manually
    this.stopCarousel();
    this.startCarousel();
  }
}
