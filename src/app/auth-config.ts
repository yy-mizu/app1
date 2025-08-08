import { MsalGuardConfiguration, MsalInterceptorConfiguration, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionType } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '30879caa-e0a4-4035-939f-bbd9450673bb',
    authority: 'https://login.microsoftonline.com/ca4306be-7510-4095-a12e-d682468faa49',
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
