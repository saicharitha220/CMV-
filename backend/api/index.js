import app from '../src/server.js';

export default async function handler(req, res) {
  return app(req, res);
}

export const config = { runtime: 'nodejs' };
