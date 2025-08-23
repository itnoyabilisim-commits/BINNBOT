export const env = (key: string, fallback?: string) => {
  const v = process.env[key];
  if (!v && fallback === undefined) throw new Error(`Missing env ${key}`);
  return v ?? fallback!;
};
export const logger = {
  info: (...a: any[]) => console.log(JSON.stringify({ level: 'info', msg: a.join(' ')})),
  error: (...a: any[]) => console.error(JSON.stringify({ level: 'error', msg: a.join(' ')})),
};
