import { Configuration, LogLevel } from '@azure/msal-browser';

// Replace these with your actual Azure AD app registration values
const clientId = '30879caa-e0a4-4035-939f-bbd9450673bb';
const authority = 'https://login.microsoftonline.com/ca4306be-7510-4095-a12e-d682468faa49';
   
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: authority,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin + '/login',
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: 'localStorage', // This enables SSO across tabs
    storeAuthStateInCookie: false, // Set to true for IE11 or Edge
    secureCookies: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string) => {
        console.log(message);
      },
      logLevel: LogLevel.Info,
      piiLoggingEnabled: false
    }
  }
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'User.Read']
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me'
};
