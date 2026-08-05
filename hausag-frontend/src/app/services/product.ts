import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Product {
  id: number;
  title: string;
  sku: string;
  short_description: string;
  long_description: string;
  category: string;
  color: string;
  tag: string;
  image_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';
  private backendUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  private fixImageUrl(product: Product): Product {
    if (product.image_url && product.image_url.startsWith('/')) {
      return { ...product, image_url: this.backendUrl + product.image_url };
    }
    return product;
  }

  getProducts(search?: string, category?: string): Observable<Product[]> {
    let url = this.apiUrl + '?';
    if (search) url += `search=${search}&`;
    if (category) url += `category=${category}&`;
    return this.http.get<Product[]>(url).pipe(
      map(products => products.map(p => this.fixImageUrl(p)))
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      map(p => this.fixImageUrl(p))
    );
  }
}
