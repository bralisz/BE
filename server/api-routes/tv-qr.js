const PAIRING_CODE = /^[A-Z0-9]{4,10}$/i;

module.exports = async function handler(req, res) {
  const code = typeof req.query?.code === 'string' ? req.query.code.trim().toUpperCase() : '';
  const raw = typeof req.query?.url === 'string' ? req.query.url.trim() : '';
  let target;

  if (code) {
    if (!PAIRING_CODE.test(code)) {
      res.status(400).json({ error: 'invalid_code' });
      return;
    }
    target = new URL(`https://billieilishtv.site/connect-tv/?code=${encodeURIComponent(code)}`);
  } else {
    if (!raw || raw.length > 1000) {
      res.status(400).json({ error: 'invalid_url' });
      return;
    }
    try {
      target = new URL(raw);
    } catch (_) {
      res.status(400).json({ error: 'invalid_url' });
      return;
    }
  }

  const allowedHosts = new Set([
    'billieilishtv.site',
    'www.billieilishtv.site',
    'billieilish-tv.vercel.app',
    'localhost'
  ]);
  if (!allowedHosts.has(target.hostname)) {
    res.status(400).json({ error: 'invalid_host' });
    return;
  }

  try {
    const QRCode = require('qrcode');
    // PNG RGB simples, margem branca maior e tamanho moderado: combinação mais
    // confiável em engines antigas de Tizen, WebOS e NetCast.
    const png = await QRCode.toBuffer(target.href, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      width: 360
    });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', String(png.length));
    res.setHeader('Cache-Control', code ? 'public, max-age=300, s-maxage=300' : 'private, no-store, max-age=0');
    res.setHeader('Pragma', code ? 'cache' : 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.end(png);
  } catch (error) {
    console.error('TV QR generation failed:', error);
    res.status(500).json({ error: 'qr_generation_failed' });
  }
};
