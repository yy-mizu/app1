import { Component, OnInit, OnDestroy } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { InteractionStatus, AccountInfo } from '@azure/msal-browser';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="account-container">
      <div class="account-box">
        <h2>Account Details - App1</h2>
        <div *ngIf="isLoading" class="loading-msg">
          <div class="spinner"></div>
          <p>Loading account information...</p>
        </div>
        <div class="user-info" *ngIf="!isLoading && account">
          <div class="welcome-section">
            <h3>Welcome, {{ account.name || account.username }}!</h3>
            <div class="account-details">
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ account.username }}</span>
              </div>
              <div class="detail-item" *ngIf="account.name">
                <label>Name:</label>
                <span>{{ account.name }}</span>
              </div>
              <div class="detail-item" *ngIf="account.localAccountId">
                <label>Account ID:</label>
                <span class="account-id">{{ account.localAccountId }}</span>
              </div>
              <div class="detail-item" *ngIf="account.tenantId">
                <label>Tenant ID:</label>
                <span class="tenant-id">{{ account.tenantId }}</span>
              </div>
            </div>
          </div>
          <div class="sso-info">
            <p class="sso-message">
              <strong>SSO Status:</strong> You are now signed in across all registered applications.
              When you visit other apps in this tenant, you should be automatically signed in.
            </p>
          </div>
        </div>
        <div *ngIf="!isLoading && !account" class="error-msg">
          No account information found. Please sign in again.
        </div>
        <div class="actions">
          <button class="logout-btn" (click)="logout()" [disabled]="isLoading">
            {{ isLoading ? 'Loading...' : 'Logout' }}
          </button>
          <button class="test-sso-btn" (click)="testSSO()" [disabled]="isLoading">
            Test SSO (Open App2)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f6fa;
      padding: 1rem;
    }
    .account-box {
      background: #fff;
      padding: 2rem 2.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      min-width: 400px;
      max-width: 600px;
      text-align: center;
    }
    .welcome-section {
      margin-bottom: 2rem;
    }
    .welcome-section h3 {
      color: #1f2937;
      margin-bottom: 1rem;
    }
    .account-details {
      text-align: left;
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 1rem;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .detail-item label {
      font-weight: 600;
      color: #374151;
    }
    .detail-item span {
      color: #2563eb;
      font-weight: 500;
      word-break: break-all;
    }
    .account-id, .tenant-id {
      font-family: monospace;
      font-size: 0.85rem;
    }
    .sso-info {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 1rem;
      margin: 1.5rem 0;
    }
    .sso-message {
      color: #065f46;
      margin: 0;
      font-size: 0.95rem;
    }
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
    .logout-btn, .test-sso-btn {
      border: none;
      border-radius: 6px;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
      min-width: 120px;
    }
    .logout-btn {
      background: #dc2626;
      color: #fff;
    }
    .logout-btn:hover:not(:disabled) {
      background: #b91c1c;
    }
    .test-sso-btn {
      background: #059669;
      color: #fff;
    }
    .test-sso-btn:hover:not(:disabled) {
      background: #047857;
    }
    .logout-btn:disabled, .test-sso-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    .error-msg {
      color: #dc2626;
      margin: 1rem 0;
      font-size: 0.95rem;
      padding: 0.5rem;
      background: #fef2f2;
      border-radius: 4px;
      border: 1px solid #fecaca;
    }
    .loading-msg {
      text-align: center;
      padding: 1rem;
    }
    .spinner {
      border: 2px solid #f3f4f6;
      border-top: 2px solid #2563eb;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AccountComponent implements OnInit, OnDestroy {
  account: AccountInfo | null = null;
  isLoading = true;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('AccountComponent: Initializing...');

    // Wait for MSAL to be initialized
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.loadAccountInfo();
      });
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  private loadAccountInfo(): void {
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      console.log('Loading account info, found accounts:', accounts.length);

      if (accounts.length > 0) {
        this.account = accounts[0];
        console.log('Account loaded:', this.account);
      } else {
        console.log('No accounts found, redirecting to login');
        this.router.navigate(['/login']);
        return;
      }
    } catch (error) {
      console.error('Error loading account info:', error);
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = false;
  }

  logout(): void {
    console.log('Logging out...');
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + '/login'
    });
  }

  testSSO(): void {
    // This would open your second app to test SSO
    // Replace with your actual App2 URL
    const app2Url = 'http://localhost:4201'; // or your App2 URL
    window.open(app2Url, '_blank');
  }
}
