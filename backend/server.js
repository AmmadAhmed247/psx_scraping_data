import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const app = express();

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Referer': 'https://www.psx.com.pk/',
};

async function scrapeMarket() {
  const html = await fetch('https://www.psx.com.pk/market-summary/', { headers: HEADERS }).then(r => r.text());
  const $ = cheerio.load(html);
  const stocks = [];

  $('table').each((_, table) => {
    let sector = 'UNKNOWN';

    $(table).find('tr').each((_, row) => {
      const ths = $(row).find('th');
      const tds = $(row).find('td');

      // sector heading row — has one th with colspan and no price data
      if (ths.length === 1 && tds.length === 0) {
        const text = ths.first().text().trim().toUpperCase();
        // skip "SCRIP LDCP OPEN..." header row
        if (!text.includes('SCRIP') && !text.includes('LDCP')) {
          sector = text;
        }
        return;
      }

      // column header row — skip
      if (ths.length > 1) return;

      // data row
      const cols = tds.map((_, td) => $(td).text().trim()).get();
      if (cols.length < 7 || !cols[0]) return;

      // skip footnote rows
      if (cols[0].startsWith('*') || cols[0].toLowerCase().includes('ldcp represents')) return;

      const name = cols[0].replace(/\s*XD\s*$/, '').replace(/\s*-\s*$/, '').trim();
      if (!name) return;

      stocks.push({
        name,                  // company name e.g. "Lucky Cement"
        sector,
        ldcp:    parseFloat(cols[1]?.replace(/,/g, '')) || 0,
        open:    parseFloat(cols[2]?.replace(/,/g, '')) || 0,
        high:    parseFloat(cols[3]?.replace(/,/g, '')) || 0,
        low:     parseFloat(cols[4]?.replace(/,/g, '')) || 0,
        current: parseFloat(cols[5]?.replace(/,/g, '')) || 0,
        change:  parseFloat(cols[6]?.replace(/,/g, '')) || 0,
        volume:  parseInt(cols[7]?.replace(/,/g, '')) || 0,
      });
    });
  });

  return stocks;
}

// GET /market
app.get('/market', async (req, res) => {
  try {
    const stocks = await scrapeMarket();
    res.json({ success: true, count: stocks.length, data: stocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /stock/:query — search by partial company name e.g. /stock/lucky or /stock/ogdc
app.get('/stock/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const stocks = await scrapeMarket();
    const found = stocks.filter(s => s.name.toLowerCase().includes(query));
    if (!found.length) return res.status(404).json({ success: false, error: `no stock matching "${query}"` });
    // if exact one match return object, else return array
    res.json({ success: true, count: found.length, data: found.length === 1 ? found[0] : found });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /sectors
app.get('/sectors', async (req, res) => {
  try {
    const stocks = await scrapeMarket();
    const sectors = [...new Set(stocks.map(s => s.sector))].filter(s => s !== 'UNKNOWN').sort();
    res.json({ success: true, count: sectors.length, data: sectors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /sector/:name
app.get('/sector/:name', async (req, res) => {
  try {
    const query = req.params.name.toUpperCase();
    const stocks = await scrapeMarket();
    const filtered = stocks.filter(s => s.sector.includes(query));
    if (!filtered.length) {
      const sectors = [...new Set(stocks.map(s => s.sector))].filter(s => s !== 'UNKNOWN').sort();
      return res.status(404).json({ success: false, error: `sector not found`, available: sectors });
    }
    res.json({ success: true, sector: filtered[0].sector, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /gainers
app.get('/gainers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const stocks = await scrapeMarket();
    const top = stocks.filter(s => s.change > 0).sort((a, b) => b.change - a.change).slice(0, limit);
    res.json({ success: true, data: top });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /losers
app.get('/losers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const stocks = await scrapeMarket();
    const top = stocks.filter(s => s.change < 0).sort((a, b) => a.change - b.change).slice(0, limit);
    res.json({ success: true, data: top });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log('PSX server → http://localhost:3000');
  console.log('  GET /market');
  console.log('  GET /stock/lucky      ← partial name search');
  console.log('  GET /stock/oil        ← finds Oil & Gas Dev');
  console.log('  GET /sectors');
  console.log('  GET /sector/CEMENT');
  console.log('  GET /gainers?limit=10');
  console.log('  GET /losers?limit=10');
});