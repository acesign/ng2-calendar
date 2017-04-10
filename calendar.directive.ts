import { Directive, ElementRef, ComponentRef, SimpleChanges, Input, Output, OnChanges, OnInit, ComponentFactoryResolver, EventEmitter, ApplicationRef, Injector, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CalendarComponent } from './calendar.component';
import * as moment from 'moment';

@Directive({
  selector: '[calendar-popup]'
})
export class CalendarDirective implements OnChanges, OnInit {
  @Input('calendar-popup') currentDate: any;
  @Input('calendar-options') options: any;
  @Input('calendar-minimum-date') minimumDate: any;
  @Input('formControl') formControl: FormControl;
  @Output('onDateChange') dateChange: EventEmitter<any> = new EventEmitter<any>();
  private _changeDetection: EventEmitter<any> = new EventEmitter<any>();
  private _position: any = {};
  private showingCalendar: boolean = false;
  private compRef: ComponentRef<CalendarComponent>;
  constructor(private el: ElementRef, private cfr: ComponentFactoryResolver, private _appRef: ApplicationRef, private injector: Injector) {}

  ngOnInit() {
    this.options = this.options ? this.options : {};
  }

  ngOnChanges(change: any) {
    if (this.compRef) {
      this._changeDetection.emit(change);
    }
    if (change.minimumDate && change.minimumDate.currentValue !== change.minimumDate.previousValue) {
      if (this._formatDate(this.currentDate).isBefore(change.minimumDate.currentValue)) {
        this.currentDate = moment(change.minimumDate.currentValue).format(this.options.format);
        // hack to avoid change detection error.
        setTimeout(() => {
          this.broadCastCurrentDateChange();
        },1);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  handleResizeWindow(event: any) {
    if (this.showingCalendar) {
      this._setPosition();
    }
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: any) {
    if (this.showingCalendar) {
      let detected: boolean = false;
      event.path.forEach((value: any) => {
        if (value.classList) {
          if (value.classList.contains('calendar') || value === this.el.nativeElement) {
            detected = true;
            return;
          }
        }
      });
      if (!detected) {
        this.destroyCalendar();
      }
    }
  }

  @HostListener('click', ['$event'])
  handleElementClick(event: any) {
    if (!this.showingCalendar) {
      this.showCalendar();
    }
  }

  showCalendar() {
    if (!this.showingCalendar) {
      let componentFactory = this.cfr.resolveComponentFactory(CalendarComponent);
      this.compRef = componentFactory.create(this.injector) as any;
      // init Calendar
      this._setPosition();
      this.compRef.instance.selectedDate = this._formatDate(this.currentDate);
      this.compRef.instance.minimumDate = this.minimumDate;
      this.compRef.instance.changedDetection = this._changeDetection;
      this.compRef.instance.options = this.options;
      this.compRef.instance.save.subscribe((value: any) => {
        this.saveCalendar(value);
      });
      this.compRef.instance.close.subscribe(() => this.destroyCalendar());
      // append Calendar
      this._appRef.attachView(this.compRef.hostView);
      this.compRef.onDestroy(() => {
        this._appRef.detachView(this.compRef.hostView);
      });
      document.body.appendChild(this.compRef.location.nativeElement);
      this.showingCalendar = true;
    }
  }

  saveCalendar(value: any) {
    this.currentDate = this.options.format ? moment(value).format(this.options.format) : moment(value).format();
    this.broadCastCurrentDateChange();
    this.destroyCalendar();
  }

  broadCastCurrentDateChange() {
    if (this.formControl) {
      this.formControl.setValue(this.currentDate);
    }
    this.dateChange.emit(this.currentDate);
  }

  destroyCalendar() {
    if (this.compRef) {
      this.compRef.destroy();
      this.compRef = null;
      this.showingCalendar = false;
    }
  }

  private _setPosition() {
    let br = this.el.nativeElement.getBoundingClientRect();
    this._position.x = br.left;
    this._position.y = br.top + br.height;
    if (this.compRef) {
      this.compRef.instance.setWindowPosition(this._position.x, this._position.y);
    }
  }

  private _formatDate(date: any): any {
    return this.options.format ? moment(date, this.options.format) : date
  }
}
