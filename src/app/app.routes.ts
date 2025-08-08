import { Routes } from '@angular/router';
import { LoginComponent, AccountComponent } from './login.component';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  { path: '', redirectTo: 'account', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'account', component: AccountComponent, canActivate: [MsalGuard] },
  { path: '**', redirectTo: 'account' }
];
