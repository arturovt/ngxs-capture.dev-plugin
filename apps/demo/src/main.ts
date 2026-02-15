import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

declare const captureKey: string;

declare global {
  interface Window {
    Capture: {
      identify: (user: object | null) => void;
      setCustomContext: (context: object) => void;
    };
    captureOptions: any;
  }
}

const promise = new Promise((resolve) => {
  window.captureOptions = { captureKey };
  const script = document.createElement('script');
  script.src = 'https://cdn.capture.dev/capture-js/browser/latest.js';
  script.addEventListener('load', resolve);
});

async function bootstrap() {
  await promise;
  window.Capture.setCustomContext({ url: '/' });
  window.Capture.identify({ userId: 'anonymous' });
  await bootstrapApplication(App, appConfig);
}

bootstrap();
