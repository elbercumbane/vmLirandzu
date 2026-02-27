import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { vmStore, debugVmStoreResumo } from './store/vmlirandzu';
import { executarTesteStoreFase1 } from './utils/testeStore';

// Expor helpers no window para testes manuais no console (não afecta UI)
if (typeof window !== 'undefined') {
  (window as any).vmStore = vmStore;
  (window as any).debugVmStoreResumo = debugVmStoreResumo;
  (window as any).executarTesteStoreFase1 = executarTesteStoreFase1;
}

bootstrapApplication(AppComponent, {
  providers: [provideAnimations(), provideRouter(routes)],
}).catch((err) => console.error(err));
