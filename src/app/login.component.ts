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
        <button class="login-btn" (click)="login()">Login with Microsoft</button>
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
  private eventCallbackId: string | null = null;

  constructor(private msalService: MsalService, private router: Router) {}

  ngOnInit() {
    if (this.msalService.instance.getAllAccounts().length > 0) {
      this.router.navigate(['/account']);
    } else {
      const instance = this.msalService.instance;
      if (typeof instance.addEventCallback === 'function' && !this.eventCallbackId) {
        this.eventCallbackId = instance.addEventCallback((event) => {
          if (event?.eventType === 'msal:loginSuccess') {
            this.router.navigate(['/account']);
          }
        });
      }
    }
  }

  async login() {
    if (this.isLoggingIn) return;
    this.isLoggingIn = true;
    const instance = this.msalService.instance;
    if (typeof instance.initialize === 'function') {
      await instance.initialize();
    }
    this.msalService.loginRedirect();
    this.isLoggingIn = false;
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

// import { Component, OnInit } from '@angular/core';
// import { MsalService } from '@azure/msal-angular';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { AuthenticationResult, AccountInfo } from '@azure/msal-browser';
// import { Injectable } from '@angular/core';
// import { CanActivate, UrlTree } from '@angular/router';
// import { Observable } from 'rxjs';

// /**
//  * GUARD TO PREVENT AUTHENTICATED USERS FROM ACCESSING LOGIN
//  */
// @Injectable({
//   providedIn: 'root'
// })
// export class PreventAuthenticatedGuard implements CanActivate {
//   constructor(private msalService: MsalService, private router: Router) {}

//   async canActivate(): Promise<boolean | UrlTree> {
//     try {
//       // Ensure MSAL is initialized before checking accounts
//       await this.msalService.instance.initialize();

//       const accounts = this.msalService.instance.getAllAccounts();

//       if (accounts.length > 0) {
//         // User is already authenticated, redirect to account
//         return this.router.createUrlTree(['/account']);
//       }

//       // User is not authenticated, allow access to login
//       return true;
//     } catch (error) {
//       console.error('Error in PreventAuthenticatedGuard:', error);
//       // On error, allow access to login page
//       return true;
//     }
//   }
// }

// /**
//  * LOGIN COMPONENT
//  */
// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   template: `
//     <div class="login-container">
//       <div class="login-box">
//         <h2>Sign in to App1</h2>
//         <button class="login-btn" (click)="login()" [disabled]="isLoggingIn">
//           {{ isLoggingIn ? 'Signing in...' : 'Login with Microsoft' }}
//         </button>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .login-container {
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       height: 100vh;
//       background: #f5f6fa;
//     }
//     .login-box {
//       background: #fff;
//       padding: 2rem 2.5rem;
//       border-radius: 12px;
//       box-shadow: 0 2px 16px rgba(0,0,0,0.08);
//       min-width: 320px;
//       text-align: center;
//     }
//     .login-btn {
//       background: #2563eb;
//       color: #fff;
//       border: none;
//       border-radius: 6px;
//       padding: 0.75rem 1.5rem;
//       font-size: 1rem;
//       cursor: pointer;
//       margin-top: 1rem;
//       transition: background 0.2s;
//     }
//     .login-btn:hover:not(:disabled) {
//       background: #1e40af;
//     }
//     .login-btn:disabled {
//       background: #9ca3af;
//       cursor: not-allowed;
//     }
//   `]
// })
// export class LoginComponent implements OnInit {
//   isLoggingIn = false;

//   constructor(private msalService: MsalService, private router: Router) {}

//   async ngOnInit() {
//     try {
//       // Ensure MSAL is initialized
//       await this.msalService.instance.initialize();

//       // Check if user is already logged in
//       const accounts = this.msalService.instance.getAllAccounts();
//       if (accounts.length > 0) {
//         this.msalService.instance.setActiveAccount(accounts[0]);
//         this.router.navigate(['/account']);
//         return;
//       }

//       // Try silent SSO for users who might have a session but no cached account
//       try {
//         const result = await this.msalService.instance.ssoSilent({
//           scopes: ['User.Read'],
//         });

//         if (result.account) {
//           this.msalService.instance.setActiveAccount(result.account);
//           this.router.navigate(['/account']);
//         }
//       } catch (silentError) {
//         // Silent SSO failed, user needs to login manually
//         console.log('Silent SSO failed, showing login button');
//       }
//     } catch (error) {
//       console.error('Error initializing MSAL:', error);
//     }
//   }

//   async login() {
//     if (this.isLoggingIn) return;

//     try {
//       this.isLoggingIn = true;

//       // Ensure MSAL is initialized before login
//       await this.msalService.instance.initialize();

//       await this.msalService.loginRedirect({
//         scopes: ['User.Read']
//       });
//     } catch (error) {
//       console.error('Login error:', error);
//       this.isLoggingIn = false;
//     }
//   }
// }

// /**
//  * ACCOUNT COMPONENT
//  */
// @Component({
//   selector: 'app-account',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   template: `
//     <div class="login-container">
//       <div class="login-box">
//         <h2>Account Details</h2>
//         <div class="user-info" *ngIf="userInfo">
//           <p><strong>Welcome!</strong></p>
//           <p>Name: <span>{{ userInfo.name }}</span></p>
//           <p>Email: <span>{{ userInfo.email }}</span></p>
//           <p>OID: <span>{{ userInfo.oid }}</span></p>
//           <p *ngIf="accessToken"><small>Access Token acquired silently.</small></p>
//         </div>
//         <div *ngIf="!userInfo" class="loading">
//           <p>Loading user information...</p>
//         </div>
//         <button class="logout-btn" (click)="logout()">Logout</button>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .login-container {
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       height: 100vh;
//       background: #f5f6fa;
//     }
//     .login-box {
//       background: #fff;
//       padding: 2rem 2.5rem;
//       border-radius: 12px;
//       box-shadow: 0 2px 16px rgba(0,0,0,0.08);
//       min-width: 320px;
//       text-align: center;
//     }
//     .logout-btn {
//       background: #2563eb;
//       color: #fff;
//       border: none;
//       border-radius: 6px;
//       padding: 0.75rem 1.5rem;
//       font-size: 1rem;
//       cursor: pointer;
//       margin-top: 1rem;
//       transition: background 0.2s;
//     }
//     .logout-btn:hover {
//       background: #1e40af;
//     }
//     .user-info {
//       margin-top: 1rem;
//       text-align: left;
//     }
//     .loading {
//       margin-top: 1rem;
//       color: #666;
//     }
//     span {
//       color: #2563eb;
//       font-weight: 500;
//     }
//   `]
// })
// export class AccountComponent implements OnInit {
//   userInfo: any = null;
//   accessToken: string | null = null;

//   constructor(private msalService: MsalService, private router: Router) {}

//   async ngOnInit() {
//     try {
//       // Ensure MSAL is initialized
//       await this.msalService.instance.initialize();

//       const account = this.msalService.instance.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];

//       if (!account) {
//         this.router.navigate(['/login']);
//         return;
//       }

//       this.msalService.instance.setActiveAccount(account);

//       // Extract user info from account and ID token claims
//       const claims = account.idTokenClaims as any;

//       this.userInfo = {
//         name: claims?.name || account.name || 'Unknown',
//         email: claims?.preferred_username || account.username || 'Unknown',
//         oid: claims?.oid || 'Unknown',
//         upn: claims?.upn || 'Unknown'
//       };

//       console.log('Full account object:', account);
//       console.log('ID token claims:', claims);
//       console.log('User info extracted:', this.userInfo);

//       // Acquire token silently for API calls
//       try {
//         const result = await this.msalService.instance.acquireTokenSilent({
//           scopes: ['User.Read'],
//           account
//         });

//         this.accessToken = result.accessToken;
//         console.log('Access token acquired:', result.accessToken);
//       } catch (tokenError) {
//         console.error('Silent token acquisition failed', tokenError);
//       }
//     } catch (error) {
//       console.error('Error in AccountComponent:', error);
//       this.router.navigate(['/login']);
//     }
//   }

//   async logout() {
//     try {
//       await this.msalService.instance.initialize();
//       this.msalService.logoutRedirect();
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   }
// }
