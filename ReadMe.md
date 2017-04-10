# Date/Time Picker
Date/Time picker for angular 2
Requires momentjs and bootstrap.
### Setup
Add CalendarInputDirective and CalendarDirective to declarations
### Basic
```sh
<input [calendar-popup]="DEFAULT_DATE" [value]="Date/Time" (onDateChange)="changeDate($event)"/>
```
### Use FormControl
```sh
<input [calendar-popup]="DEFAULT_DATE" [value]="Date/Time" [formControl]="" ngDefaultControl/>
```
## Options
| Option | Value | Default |
| ------ | ----- | ------ |
| format | moment format options | |
| locale | string | en |
| showTime | boolean | true |
| saveOnDateSelect | boolean | false |
```sh
<input [calendar-popup]="DEFAULT_DATE" [calendar-options]="{format: 'MM/DD/YYYY HH:mm'}"/>
```
