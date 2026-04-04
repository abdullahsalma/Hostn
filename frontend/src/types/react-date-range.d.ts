declare module 'react-date-range' {
  import { ComponentType } from 'react';

  export interface Range {
    startDate?: Date;
    endDate?: Date;
    key?: string;
  }

  export interface RangeKeyDict {
    [key: string]: Range;
  }

  export interface DateRangeProps {
    ranges: Range[];
    onChange: (ranges: RangeKeyDict) => void;
    months?: number;
    direction?: 'horizontal' | 'vertical';
    minDate?: Date;
    maxDate?: Date;
    rangeColors?: string[];
    showDateDisplay?: boolean;
    showMonthAndYearPickers?: boolean;
    moveRangeOnFirstSelection?: boolean;
    locale?: object;
    className?: string;
  }

  export const DateRange: ComponentType<DateRangeProps>;
  export const DateRangePicker: ComponentType<DateRangeProps>;
  export const Calendar: ComponentType<Record<string, unknown>>;
}

declare module 'react-date-range/dist/styles.css';
declare module 'react-date-range/dist/theme/default.css';
