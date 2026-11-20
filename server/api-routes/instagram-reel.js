'use strict';

const ACCOUNT = 'billieilishtv_';

async function latestReel(accountId, token) {
  const url = new URL('https://graph.facebook.com/v25.0/' + accountId + '/media');
  url.searchParams.set('fields', 'username,media_product_type,thumbnail_url,permalink,timestamp');
  url.searchParams.set('limit', '50');
  const signal = AbortSignal.timeout(8000);
  const seen = new Set();
  while (true) {
    const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token }, signal });
    if (!response.ok) throw new Error('Instagram media unavailable');
    const page = await response.json();
    if (!Array.isArray(page.data)) throw new Error('Invalid Instagram response');
    const reel = page.data.filter(item => item.media_product_type === 'REELS' &&
      String(item.username).toLowerCase() === ACCOUNT)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
    if (reel) {
      if (!/^https:\/\/(?:www\.)?instagram\.com\/(?:reels?|p)\/[\w-]+\/?(?:\?.*)?$/i.test(reel.permalink) ||
          !/^https:\/\//i.test(reel.thumbnail_url)) return null;
      return { permalink: reel.permalink, thumbnail: reel.thumbnail_url };
    }
    const after = page.paging?.cursors?.after;
    if (!page.paging?.next || !after || seen.has(after)) return null;
    seen.add(after);
    url.searchParams.set('after', after);
  }
}

module.exports = async function instagramReel(req, res) {
  if (req.method !== 'GET') return res.status(405).setHeader('Allow', 'GET').end();
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const id = process.env.INSTAGRAM_USER_ID;
  if (!token || !/^\d+$/.test(id || '')) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).end();
  }
  try {
    const reel = await latestReel(id, token);
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300');
    return res.status(200).json({ reel });
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).end();
  }
};
