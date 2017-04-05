# Date/Time Picker
Date/Time picker for angular 2
Requires momentjs and bootstrap.
### Setup
Add CalendarInputDirective and CalendarDirective to declarations
### Basic
```sh
<calendar-selector [value]="Date/Time" (onDateChange)="changeDate($event)"></calendar-selector>
```
### Use FormControl
```sh
<calendar-selector [value]="Date/Time" [formControl]="" ngDefaultControl></calendar-selector>
```
## Options
| Option | Value | Default |
| ------ | ----- | ------ |
| format | moment format options | |
| locale | string | en |
| showTime | boolean | true |
| saveOnDateSelect | boolean | false |
```sh
<calendar-selector [options]="{format: 'MM/DD/YYYY HH:mm'}"></calendar-selector>
```
