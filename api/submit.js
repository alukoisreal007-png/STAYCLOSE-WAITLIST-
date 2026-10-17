function sendJson(res, statusCode, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead ? res.writeHead(200).end() : res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLeAGg0Jqn5qjQ3-47F1HjW-Ds3z732-ysQLoJWSm6F6XAsfUcurVDmvZrMWpi1ezM/exec';

  try {
    let rawBody = '';
    if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (req.body && typeof req.body === 'object') {
      rawBody = new URLSearchParams(req.body).toString();
    } else {
      rawBody = await new Promise((resolve) => {
        let str = '';
        req.on('data', chunk => { str += chunk; });
        req.on('end', () => resolve(str));
      });
    }

    const scriptResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawBody
    });

    const data = await scriptResponse.json();
    return sendJson(res, 200, data);
  } catch (error) {
    console.error('Vercel API submit error:', error);
    return sendJson(res, 500, { ok: false, error: error.message });
  }
};
