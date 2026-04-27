import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './captcha.html',
  styleUrl: './captcha.scss'
})
export class Captcha {
  captchaId: string = '';
  captchaImageUrl: string = '';
  userInput: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCaptcha();
  }

  loadCaptcha(): void {
    this.isLoading = true;
    
    this.http.get(`${environment.apiUrl}/captcha/generate`, {
      responseType: 'arraybuffer',
      observe: 'response'
    }).subscribe({
      next: (response: any) => {
        this.captchaId = response.headers.get('X-Captcha-Id');
        const imageBlob = new Blob([response.body], { type: 'image/png' });
        this.captchaImageUrl = URL.createObjectURL(imageBlob);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load captcha:', error);
        this.isLoading = false;
      }
    });
  }

  refreshCaptcha(): void {
    this.userInput = '';
    this.loadCaptcha();
  }

  getCaptchaData(): { captchaId: string; userInput: string } {
    return {
      captchaId: this.captchaId,
      userInput: this.userInput
    };
  }

  isValid(): boolean {
    return this.userInput.length > 0;
  }
}
