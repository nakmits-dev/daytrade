export function getJSTDate(date: Date): Date {
  return new Date(date.getTime() + (9 * 60 * 60 * 1000));
}

export function getJSTDateString(date: Date): string {
  const jstDate = getJSTDate(date);
  const year = jstDate.getUTCFullYear();
  const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getJSTDateTime(): string {
  return new Date(Date.now() + (9 * 60 * 60 * 1000)).toISOString();
}