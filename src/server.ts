import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { InjectionToken } from '@angular/core';
import { Request, Response } from 'express';
export const REQUEST = new InjectionToken<Request>('REQUEST');
export const RESPONSE = new InjectionToken<Response>('RESPONSE');

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

const COOKIE_NAME = 'test-cookie';

app.get('/test', (req, res) => {
  res.setHeader('Test-Header', 'Test-Value');
  if (!req.headers['cookie'] || !req.headers['cookie'].includes(COOKIE_NAME)) {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=test-value; HttpOnly; Path=/; SameSite=Lax`);
  }
  res.json({
    message: 'Hello from the server!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/**', async(req, res, next) => {
  if (!req.headers['cookie'] || !req.headers['cookie'].includes(COOKIE_NAME)) {
    const cookieResponse = await fetch('http://localhost:4000/test');
    const setCookie = cookieResponse.headers.get('set-cookie');
    req.headers['set-cookie'] = [setCookie || ''];
    res.req = req;
  }  
  angularApp
    .handle(req)
    .then(response => {
      if (req.headers['set-cookie']) {
        res.setHeader('Set-Cookie', req.headers['set-cookie']);
      }
      response ? writeResponseToNodeResponse(response, res) : next();
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;

  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
