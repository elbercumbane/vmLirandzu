import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { lirandzoRoleInterceptor } from './shared/interceptors/lirandzo-role.interceptor';
import { provideTransloco } from '@ngneat/transloco';

import { routes } from './app.routes';
import { TranslocoHttpLoader } from './i18n/transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withViewTransitions()
    ),
    provideHttpClient(withInterceptors([lirandzoRoleInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['pt', 'en'],
        defaultLang: 'pt',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ]
};
