import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CatalogComponent } from './pages/catalog/catalog';
import { ProductDetailComponent } from './pages/product-detail/product-detail';
import { About } from './pages/about/about';
import { Faq } from './pages/faq/faq';
import { Contact } from './pages/contact/contact';
import { CartComponent } from './pages/cart/cart';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'catalogo', component: CatalogComponent },
  { path: 'catalogo/:id', component: ProductDetailComponent },
  { path: 'nosotros', component: About },
  { path: 'faq', component: Faq },
  { path: 'contacto', component: Contact },
  { path: 'carrito', component: CartComponent },
  { path: '**', redirectTo: '' }
];
