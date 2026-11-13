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

module.exports = async function() {
  try {
    return await load();
  } catch (err) {
    console.warn('YouTube feed unavailable, skipping videos:', err.message);
    return [];
  }
};
