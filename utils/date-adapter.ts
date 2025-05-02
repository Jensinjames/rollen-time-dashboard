import { format, parse, isValid, addDays, addMonths } from "date-fns"

// This adapter helps normalize date-fns usage across the application
// to prevent compatibility issues with different versions
export const dateAdapter = {
  format: (date: Date | number, formatString: string) => {
    return format(date, formatString)
  },

  parse: (dateString: string, formatString: string, referenceDate: Date) => {
    return parse(dateString, formatString, referenceDate)
  },

  isValid: (date: Date) => {
    return isValid(date)
  },

  addDays: (date: Date | number, amount: number) => {
    return addDays(date, amount)
  },

  addMonths: (date: Date | number, amount: number) => {
    return addMonths(date, amount)
  },
}
