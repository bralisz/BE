const QRCode = require('qrcode');

module.exports = async function handler(req, res) {
  const raw = typeof req.query?.url === 'string' ? req.query.url.trim() : '';
  if (!raw || raw.length > 1000) {
    res.status(400).json({ error: 'invalid_url' });
    return;
  }

  let target;
  try {
    target = new URL(raw);
  } catch (_) {
    res.status(400).json({ error: 'invalid_url' });
    return;
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
    // PNG is intentionally used here because older Smart TV browsers can
    // render it reliably, while SVG support in <img> is inconsistent.
    const png = await QRCode.toBuffer(target.href, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      width: 520
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(png);
  } catch (error) {
    console.error('TV QR generation failed:', error);
    res.status(500).json({ error: 'qr_generation_failed' });
  }
};
