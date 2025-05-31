import { ApplicationConfig, inject, Injectable, provideZoneChangeDetection, REQUEST } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';

@Injectable()
class Interceptor implements HttpInterceptor {
  private request = inject(REQUEST, { optional: true });
  intercept(req: HttpRequest<any>, handler: HttpHandler) {
    const requestHeaders = this.request?.headers;
    const headers: Record<string, string> = {};
    if (requestHeaders) {
      requestHeaders.forEach((value, name) => {
        if (name === 'set-cookie') {
          headers['cookie'] = value;
          return;
        }
        headers[name] = value;
      });
    }

    const authReq = req.clone({
      withCredentials: true, // Include credentials (cookies) in the request, not sure if needed
      headers: new HttpHeaders({
        ...headers,
      }),
    });


    return handler.handle(authReq);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    
    provideRouter(routes),
    provideClientHydration(withHttpTransferCacheOptions({
      includeHeaders: ['test-header'],
    })),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true,
    },
  ],
};