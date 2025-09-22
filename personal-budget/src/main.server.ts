import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

export default function (context: any) {
  return bootstrapApplication(
    AppComponent,
    {
      ...appConfig,
      providers: [...(appConfig.providers ?? []), provideServerRendering()],
    },
    context,
  );
}
