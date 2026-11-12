// A period « au 31 octobre » includes the whole 31st (recette R12-04). A date
// typed without an hour arrives as midnight UTC; used as an upper bound with
// `lte`, it would leave out every movement of that last day. A date that does
// carry an hour is kept as it is.
export function throughEndOfDay(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return date;
  const midnight = date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;
  return midnight ? new Date(date.getTime() + 86400000 - 1) : date;
}
