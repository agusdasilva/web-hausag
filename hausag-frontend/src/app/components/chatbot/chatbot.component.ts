import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  isOpen = false;
  userInput = '';
  isLoading = false;
  isHomePage = false;
  shouldHide = false;
  
  messages: { text: string, isUser: boolean, error?: boolean }[] = [];
  chatHistory: ChatMessage[] = [];

  @ViewChild('chatBody') private chatBody!: ElementRef;

  constructor(
    private chatbotService: ChatbotService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHomePage = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '';
      this.checkVisibility();
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkVisibility();
  }

  private checkVisibility() {
    // Hide if we are on the home page AND at the very top (scroll < 100px)
    if (this.isHomePage) {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      this.shouldHide = scrollPosition < 300; // Adjust threshold as needed
      if (this.shouldHide) {
        this.isOpen = false;
      }
    } else {
      this.shouldHide = false;
    }
  }

  ngOnInit(): void {
    // Optional: Add a welcome message
    this.messages.push({
      text: '¡Hola! Bienvenido a Hausag. Soy tu asistente virtual. ¿En qué te puedo ayudar hoy?',
      isUser: false
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  scrollToBottom(): void {
    try {
      if (this.chatBody && this.chatBody.nativeElement) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.userInput = '';
    
    // Add to UI
    this.messages.push({ text, isUser: true });
    
    // Add to API history
    this.chatHistory.push({ role: 'user', parts: [{ text }] });
    
    this.isLoading = true;

    this.chatbotService.sendMessage(this.chatHistory).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        let aiText = 'Hubo un error de formato.';
        if (response && response.candidates && response.candidates.length > 0) {
          aiText = response.candidates[0].content.parts[0].text;
          
          // Add to API history for next round
          this.chatHistory.push({ role: 'model', parts: [{ text: aiText }] });
        } else {
          console.error("Respuesta extraña de la IA:", response);
        }

        // Add to UI
        this.messages.push({ text: aiText, isUser: false });
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error in chatbot:', err);
        
        // Remove the user's message from history so they can retry, or just show error
        this.chatHistory.pop();
        this.messages.push({ 
          text: 'Disculpá, tuvimos un problema de conexión con la inteligencia artificial. Intentá nuevamente más tarde.', 
          isUser: false, 
          error: true 
        });
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }
}
