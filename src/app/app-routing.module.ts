import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EstadisticageneralComponent } from './estadisticageneral/estadisticageneral.component';
import { EstadisticaIndividualComponent } from './estadistica-individual/estadistica-individual.component';
import { ResumenComponent } from './resumen/resumen.component';
const routes: Routes = [
  { path: '', component: EstadisticageneralComponent },
  { path: 'individual/:moneda', component: EstadisticaIndividualComponent },
  { path: 'resumen', component: ResumenComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }