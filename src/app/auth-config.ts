import { MsalGuardConfiguration, MsalInterceptorConfiguration, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionType } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '1863ffc9-6237-4ac9-96ae-58c0b10a8905',
    authority: 'https://login.microsoftonline.com/65dde530-309a-4b9a-9e8c-d2a8c9a8b40a',
    redirectUri: 'http://localhost:4200',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read']
    },
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      ['https://graph.microsoft.com/v1.0/me', ['user.read']]
    ])
  };
}
