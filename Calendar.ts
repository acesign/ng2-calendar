import { Component, Input, Output, EventEmitter, OnInit, SimpleChange } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from '../../../../node_modules/moment';

interface ICalendarMonth {
  value: number,
  name: string
}

@Component({
  selector: 'calendar-popup',
  template: require('./Calendar.html'),
  styles: [
    'a { cursor: pointer;}',
    '.table {margin-bottom: 5px;}',
    '.calendar-dates > table, .calendar-dates th { text-align: center;}',
    '.calendar-day {cursor: pointer; border-left: 1px solid #fff;}',
    '.calendar-day:hover {background-color: #e8e8e8;}',
    '.calendar-day.muted, .calendar-day.disabled {background-color: #f5f5f5; border-left: 1px solid #f5f5f5; color:grey;}',
    '.calendar-day.disabled {cursor: not-allowed; color: #dcdcdc; border-left: 1px solid #f5f5f5;}',
    '.calendar-day.selected, .calendar-months ul.calendar-month-selector > li.selected {background-color: #dff0d8; border: 1px solid #5cb85c; position:relative; color: #3c763d; font-weight: bold;}',
    '.calendar-day .day-selected { display: none;}',
    '.calendar-day.selected .day-selected { display: inline-block; position:absolute; top:0px; right:5px;}',
    '.calendar-time .calendar-time-input { display: inline-block; width: 45%;}',
    '.calendar-time { margin-bottom: 10px; display: inline-block;}',
    '.calendar-arrow { cursor: pointer; }',
    '.calendar-months {overflow: hidden; margin-top: 5px;}',
    '.calendar-months ul.calendar-month-selector {list-style: none; margin-left:-10px}',
    '.calendar-months ul.calendar-month-selector > li {float: left; width: 20%; text-align: center; height: 50px; border: 1px solid #c7c5c5; margin: 3px; border-radius: 5px;}',
    '.calendar-months ul.calendar-month-selector > li:hover {background-color: #e8e8e8; cursor: pointer;}',
    '.calendar-months ul.calendar-month-selector > li div.calendar-month-text {margin-top: 15px; display:inline-block;}'
  ],
  host: {'style': `
    position: absolute;
    background-color: #fff;
    border: 1px solid #e3e3e3;
    width: 350px; padding: 5px;
    z-index: 1001;
    box-shadow: 5px 5px 10px 0px #d6d6d6;
    border-radius: 5px;
    `,'[style.top]': '_position.y+"px"', '[style.left]': '_position.x+"px"', 'class': 'calendar', '[style.position]': '_position.position'}
})

export class CalendarDirective implements OnInit {
  selectedMonth: string;
  selectedYear: string;
  selectedHour: string;
  selectedMinute: string;
  daysOfWeek: string[];
  days: Array<Array<moment.Moment>>;
  hourControl: FormControl = new FormControl();
  minuteControl: FormControl = new FormControl();
  minHour: number;
  minMinute: number;
  @Input() selectedDate: any;
  @Input() minimumDate: any = false;
  @Input() options: any;
  @Input() changedDetection: EventEmitter<any>;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() save: EventEmitter<any> = new EventEmitter<any>();
  private _position: any;
  private _text: any;
  private _today: moment.Moment;
  private _showChangeMonth: boolean = false;
  private _selectedDate: moment.Moment;
  private _currentDate: any;
  private _monthsList: ICalendarMonth[];
  private _options: any;
  constructor() {
    this._position = {x: 0, y: 0, position: 'absolute'};
    this.minHour = 0;
    this.minMinute = 0;
    this.options = {};
    this._today = moment();
    this._text = {apply: 'Apply', cancel: 'Cancel', back: 'Back', months: 'Months', time: 'Time', today: 'Today'};
  }

  ngOnInit() {
    this._options = Object.assign({}, {showTime: true, locale: 'en', saveOnDateSelect: false}, this.options);
    this._initStatics();
    this._selectedDate = this.selectedDate ? this.dateBelowMinimum(this.selectedDate) ? this._newMoment(this.minimumDate) : this._newMoment(this.selectedDate) : this._newMoment();
    this._currentDate = this._newMoment(this.selectedDate);
    this._refreshTime();
    this._refreshDate();
    this.changedDetection.subscribe((value: {currentDate?: SimpleChange; minimumDate?: SimpleChange; }) => {
      let {currentDate, minimumDate} = value;
      if (currentDate && currentDate.currentValue !== currentDate.previousValue) {
        this._selectedDate = this._newMoment(currentDate.currentValue);
      }
      if (minimumDate && minimumDate.currentValue !== minimumDate.previousValue) {
        this.minimumDate = this._newMoment(minimumDate.currentValue);
        this._refreshDate();
      }
    });
    let wait: number = 350;
    this.hourControl.valueChanges.debounceTime(wait).subscribe((value) => {
      this._currentDate.hour(value);
      this._refreshTime();
    });
    this.minuteControl.valueChanges.debounceTime(wait).subscribe((value) => {
      this._currentDate.minute(value);
      this._refreshTime();
    });
  }

  setWindowPosition(x: number | string, y: number | string, position: string = 'absolute') {
    let newX = x;
    let newY = y;
    if (window.innerWidth < 550 && window.innerWidth > 362) {
      newX = (window.innerWidth - 362) / 2;
    }
    this._position.x = newX;
    this._position.y = newY;
  }

  goToToday(): void {
    this._selectedDate = this._newMoment();
    this._currentDate = this._selectedDate.clone();
    this._refreshDate();
  }

  nextItem(type: string) {
    this._currentDate.add(1, type);
    this._refreshDate();
  }

  prevItem(type: string) {
    this._currentDate.subtract(1, type);
    this._refreshDate();
  }

  dateFromOtherMonth(date: moment.Moment): boolean {
    return moment(date).month() !== this._currentDate.month();
  }

  dateBelowMinimum(date: moment.Moment): boolean {
    if (!this.minimumDate) {
      return false;
    }
    return this._newMoment(this.minimumDate).isAfter(this._newMoment(date));
  }

  isDaySelected(date: moment.Moment): boolean {
    return moment(moment(this._selectedDate).format('YYYY-MM-DD')).isSame(moment(date).format('YYYY-MM-DD'));
  }

  selectDay(date: moment.Moment) {
    if (!this.dateBelowMinimum(date)) {
      this._selectedDate = this._newMoment(date);
      this.setMinimumTime();
      if (this._options.saveOnDateSelect) {
        this.applyCalendar();
      }
    }
  }

  cancelCalendar() {
    this.close.emit(true);
  }

  applyCalendar() {
    /* @todo:: final validation checks */
    if (this._options.showTime) {
      if ((this.minHour && this.minHour > parseInt(this.selectedHour, 10)) || (this.minMinute && this.minMinute > parseInt(this.selectedMinute, 10))) {
        return;
      }
    }
    this.save.emit(this._selectedDate.hour(this._currentDate.hour()).minute(this._currentDate.minute()));
  }

  selectMonth(month: number) {
    this._currentDate.month(month);
    this._refreshDate();
    this.toggleMonths();
  }

  isMonthSelected(month: number) {
    return month === parseInt(this._currentDate.month(), 10);
  }

  toggleMonths() {
    this._showChangeMonth = !this._showChangeMonth;
    return this._showChangeMonth;
  }

  setMinimumTime() {
    if (this.minimumDate) {
      let sd = this._newMoment(this._selectedDate).hour(parseInt(this.selectedHour, 10)).minute(parseInt(this.selectedMinute, 10));
      this.minHour = this._newMoment(this.minimumDate).isSameOrAfter(sd) ? this._newMoment(this.minimumDate).hour() : 0;
      this.minMinute = this._newMoment(this.minimumDate).isSameOrAfter(sd) ? this._newMoment(this.minimumDate).minute() : 0;
    }
  }

  private _initStatics() {
    this.daysOfWeek = [];
    this._monthsList = [];
    for (let i = 0; i < 7; i++) {
      this.daysOfWeek.push(this._newMoment().day(i).format('ddd'));
    }
    for (let i = 0; i < 12; i++ ) {
      this._monthsList.push({value: i, name: this._newMoment().month(i).format('MMM')});
    }
  }

  private _refreshTime() {
    this.selectedHour = this._currentDate.format('HH');
    this.selectedMinute = this._currentDate.format('mm');
    this.setMinimumTime();
  }

  private _refreshDate() {
    this.selectedMonth = this._currentDate.format('MMMM');
    this.selectedYear = this._currentDate.format('YYYY');
    this._setDays();
  }

  private _setDays() {
    this.days = [];
    let current = this._newMoment(this._currentDate);
    let week = [];
    let daysFromFirst = parseInt(current.clone().date(1).format('d'), 10);
    /* determine if first day of the week */
    for (let i = 0; i < daysFromFirst; i++) {
      week.push(current.clone().date(1).subtract(daysFromFirst - i, 'd'));
    }
    week.push(current.clone().date(1));
    for (let i = 2; i <= current.daysInMonth(); i++) {
      if (week.length === 7) {
        this.days.push(week);
        week = [];
      }
      week.push(current.clone().date(i));
    }
    let temp = current.clone().date(current.daysInMonth());
    for (let i = week.length; i < 7; i++) {
      temp.add(1, 'd');
      week.push(temp.clone());
    }
    this.days.push(week); // pushes the last week;
  }

  private _newMoment(date?: any) {
    return moment(date).locale(this._options.locale).second(0).millisecond(0);
  }
}
