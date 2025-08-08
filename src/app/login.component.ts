import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>Sign in to App1</h2>
        <button class="login-btn" (click)="login()" [disabled]="isLoggingIn">{{ isLoggingIn ? 'Signing in...' : 'Login with Microsoft' }}</button>
        <div *ngIf="loginError" class="error-msg">{{ loginError }}</div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #f5f6fa;
    }
    .login-box {
      background: #fff;
      padding: 2rem 2.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      min-width: 320px;
      text-align: center;
    }
    .login-btn {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
      transition: background 0.2s;
    }
    .login-btn:hover {
      background: #1e40af;
    }
  `]
})
export class LoginComponent implements OnInit {
  isLoggingIn = false;
  loginError: string | null = null;
  private eventCallbackId: string | null = null;

  constructor(private msalService: MsalService, private router: Router) {}

  async ngOnInit() {
    this.loginError = null;
    try {
      // Ensure MSAL is initialized before checking accounts
      const instance = this.msalService.instance;
      if (typeof instance.initialize === 'function') {
        await instance.initialize();
      }
      // Debug: log current route
      console.log('Current route:', this.router.url);
      // If already logged in, redirect to account page
      if (instance.getAllAccounts().length > 0) {
        this.router.navigate(['/account']);
      } else {
        // If not on /login, force navigation to /login
        if (this.router.url !== '/login') {
          this.router.navigate(['/login']);
        }
        // Listen for MSAL redirect callback and redirect to /account if authenticated
        if (typeof instance.addEventCallback === 'function' && !this.eventCallbackId) {
          this.eventCallbackId = instance.addEventCallback((event) => {
            if (event?.eventType === 'msal:loginSuccess') {
              // Force reload to ensure Angular routing state is correct after MSAL login
              window.location.href = '/account';
            }
          });
        }
      }
    } catch (err) {
      this.loginError = 'Failed to initialize authentication. Please refresh and try again.';
      console.error('MSAL init error:', err);
    }
  }

  async login() {
    if (this.isLoggingIn) return;
    this.isLoggingIn = true;
    this.loginError = null;
    try {
      const instance = this.msalService.instance;
      if (typeof instance.initialize === 'function') {
        await instance.initialize();
      }
      this.msalService.loginRedirect();
    } catch (err) {
      this.loginError = 'Login failed. Please try again.';
      console.error('Login error:', err);
      this.isLoggingIn = false;
    }
    // isLoggingIn will be reset after redirect or on error
  }
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>Account Details</h2>
        <div class="user-info" *ngIf="entraId">
          <p><strong>Welcome!</strong></p>
          <p>Entra ID: <span>{{ entraId }}</span></p>
        </div>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .error-msg {
      color: #dc2626;
      margin-top: 1rem;
      font-size: 0.95rem;
    }
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #f5f6fa;
    }
    .login-box {
      background: #fff;
      padding: 2rem 2.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      min-width: 320px;
      text-align: center;
    }
    .logout-btn {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
      transition: background 0.2s;
    }
    .logout-btn:hover {
      background: #1e40af;
    }
    .user-info {
      margin-top: 1rem;
    }
    span {
      color: #2563eb;
      font-weight: 500;
    }
  `]
})
export class AccountComponent implements OnInit {
  entraId: string | null = null;

  constructor(private msalService: MsalService, private router: Router) {}

  ngOnInit() {
    const account = this.msalService.instance.getAllAccounts()[0];
    if (account) {
      this.entraId = account.username;
      console.log('Logged in Entra ID:', account);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.msalService.logoutRedirect();
  }
}
