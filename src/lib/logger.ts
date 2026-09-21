export function newRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function logRequest(opts: {
  requestId: string;
  route: string;
  userId?: string;
  durationMs: number;
  status: number;
  error?: string;
}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    ...opts,
  });
  if (opts.status >= 500) console.error(line);
  else console.log(line);
}
