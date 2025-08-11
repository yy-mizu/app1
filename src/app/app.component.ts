import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { Subject, filter, takeUntil } from 'rxjs';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Angular MSAL SSO Demo - App1</h1>
        <div class="auth-status" *ngIf="!isLoading">
          <span [class]="isAuthenticated ? 'authenticated' : 'not-authenticated'">
            {{ isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated' }}
          </span>
        </div>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .app-header {
      background: #1f2937;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .app-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    .auth-status {
      font-size: 0.9rem;
    }
    .authenticated {
      color: #10b981;
      font-weight: 600;
    }
    .not-authenticated {
      color: #f87171;
      font-weight: 600;
    }
    .app-main {
      flex: 1;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-msal-app1';
  isAuthenticated = false;
  isLoading = true;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  setLoginDisplay(): void {
    this.isAuthenticated = this.msalService.instance.getAllAccounts().length > 0;
    this.isLoading = false;
    console.log('Authentication status:', this.isAuthenticated);
  }
}
