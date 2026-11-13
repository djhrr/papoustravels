const https   = require('https');
const xml2js  = require('xml2js');

const CHANNEL_ID = 'UCVn3JYN3YpXpOxn-hacLjYg';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function load() {
  const xml    = await fetchUrl(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
  const result = await xml2js.parseStringPromise(xml, { explicitArray: false });
  const entries = result.feed.entry;
  const list    = Array.isArray(entries) ? entries : (entries ? [entries] : []);

  return list.slice(0, 4).map(entry => ({
    id:          entry['yt:videoId'],
    title:       entry.title,
    url:         entry.link.$.href,
    thumbnail:   entry['media:group']['media:thumbnail'].$.url,
    description: (entry['media:group']['media:description'] || '').slice(0, 200),
    published:   entry.published
  }));
}

// The RSS feed is intermittently 404; the channel page still lists videos.
async function scrapeChannel() {
  const html = await new Promise((resolve, reject) => {
    https.get(`https://www.youtube.com/channel/${CHANNEL_ID}/videos`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'Accept-Language': 'en-US' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
  const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!match) return [];
  const found = [];
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    const l = o.lockupViewModel;
    if (l && l.contentId && l.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
      const title = l.metadata && l.metadata.lockupMetadataViewModel && l.metadata.lockupMetadataViewModel.title;
      if (title && title.content && !found.some(v => v.id === l.contentId)) {
        found.push({
          id:          l.contentId,
          title:       title.content,
          url:         `https://www.youtube.com/watch?v=${l.contentId}`,
          thumbnail:   `https://i.ytimg.com/vi/${l.contentId}/hqdefault.jpg`,
          description: '',
          published:   ''
        });
      }
    }
    for (const k in o) walk(o[k]);
  })(JSON.parse(match[1]));
  return found.slice(0, 4);
}

module.exports = async function() {
  try {
    const videos = await load();
    if (videos.length) return videos;
  } catch (err) {
    console.warn('YouTube feed unavailable, trying channel page:', err.message);
  }
  try {
    return await scrapeChannel();
  } catch (err) {
    console.warn('YouTube channel page unavailable, skipping videos:', err.message);
    return [];
  }
};