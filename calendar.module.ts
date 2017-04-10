import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarDirective } from './calendar.directive';
import { CalendarComponent } from './calendar.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CalendarDirective,
    CalendarComponent
  ],
  exports: [CalendarDirective],
  entryComponents: [ CalendarComponent ]
})
export class CalendarModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CalendarModule
    };
  };
}
