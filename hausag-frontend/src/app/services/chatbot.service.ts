import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // Usa siempre el mismo origen (protocolo + host + puerto) que la página actual
  // Así funciona en localhost:8080, en producción y en cualquier servidor
  private get apiUrl(): string {
    return `${window.location.origin}/api/chatbot.php`;
  }

  constructor(private http: HttpClient) {}

  sendMessage(history: ChatMessage[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { history });
  }
}
