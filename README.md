# psx-api

A free, open-source REST API for Pakistan Stock Exchange (PSX) data. Built with Node.js and Cheerio — scrapes directly from the official PSX website and returns clean JSON.

No API key required. No rate limits. Just run it locally or deploy it anywhere.

---

## Why

PSX has no public API. Every Pakistani developer building a finance app, portfolio tracker, or trading tool has to figure this out from scratch. This project solves that once and for all.

---

## Stack

- **Node.js** (ESM)
- **Express** — HTTP server
- **Cheerio** — HTML scraping
- **node-fetch** — HTTP requests

Data source: [psx.com.pk/market-summary](https://www.psx.com.pk/market-summary/)

---

## Getting Started

```bash
git clone https://github.com/yourusername/psx-api.git
cd psx-api
npm install
npm start
```

Server runs on `http://localhost:3000`

---

## Endpoints

### `GET /market`
All stocks currently trading on PSX regular market.

```bash
GET http://localhost:3000/market
```

```json
{
  "success": true,
  "count": 523,
  "data": [
    {
      "name": "Lucky Cement",
      "sector": "CEMENT",
      "ldcp": 1050.00,
      "open": 1055.00,
      "high": 1060.00,
      "low": 1048.00,
      "current": 1058.50,
      "change": 8.50,
      "volume": 125000
    }
  ]
}
```

---

### `GET /stock/:query`
Search for a stock by partial company name.

```bash
GET http://localhost:3000/stock/lucky
GET http://localhost:3000/stock/oil
GET http://localhost:3000/stock/habib bank
GET http://localhost:3000/stock/engro
```

```json
{
  "success": true,
  "count": 1,
  "data": {
    "name": "Lucky Cement",
    "sector": "CEMENT",
    "ldcp": 1050.00,
    "open": 1055.00,
    "high": 1060.00,
    "low": 1048.00,
    "current": 1058.50,
    "change": 8.50,
    "volume": 125000
  }
}
```

> **Note:** PSX market summary uses full company names, not ticker symbols. Search by partial name e.g. `oil` instead of `OGDC`, `lucky` instead of `LUCK`.

---

### `GET /sectors`
List all available sectors.

```bash
GET http://localhost:3000/sectors
```

```json
{
  "success": true,
  "count": 32,
  "data": [
    "AUTOMOBILE ASSEMBLER",
    "BANKING",
    "CEMENT",
    "CHEMICAL",
    "FERTILIZER",
    "OIL & GAS EXPLORATION",
    "TECHNOLOGY & COMMUNICATION",
    ...
  ]
}
```

---

### `GET /sector/:name`
All stocks in a specific sector. Use partial sector name.

```bash
GET http://localhost:3000/sector/CEMENT
GET http://localhost:3000/sector/BANKING
GET http://localhost:3000/sector/OIL
GET http://localhost:3000/sector/TECH
```

```json
{
  "success": true,
  "sector": "CEMENT",
  "count": 22,
  "data": [...]
}
```

---

### `GET /gainers`
Top gaining stocks today. Optional `limit` query param (default: 10).

```bash
GET http://localhost:3000/gainers
GET http://localhost:3000/gainers?limit=20
```

---

### `GET /losers`
Top losing stocks today. Optional `limit` query param (default: 10).

```bash
GET http://localhost:3000/losers
GET http://localhost:3000/losers?limit=20
```

---

## Data Fields

| Field | Description |
|---|---|
| `name` | Full company name as listed on PSX |
| `sector` | Market sector |
| `ldcp` | Last Day Close Price |
| `open` | Today's opening price |
| `high` | Today's high |
| `low` | Today's low |
| `current` | Current trading price |
| `change` | Change from LDCP |
| `volume` | Total volume traded today |

---

## Deployment

Works on any Node.js host. Recommended:

- **Railway** — `railway up`
- **Render** — connect repo, auto deploys
- **VPS** — run with `pm2 start server.js`

---

## Limitations

- Data is only available during PSX market hours (Mon–Fri, 9:15 AM – 3:30 PM PKT)
- PSX uses full company names, not ticker symbols — search by name
- No historical data yet (coming soon)
- No real-time streaming — each request scrapes fresh data

---

## Roadmap

- [ ] Ticker symbol mapping (OGDC, HBL, LUCK etc)
- [ ] Historical EOD data
- [ ] KSE-100 / KSE-30 index values
- [ ] Caching layer (Redis) to reduce PSX server load
- [ ] WhatsApp alerts integration

---

## Contributing

PRs welcome. If you have the ticker → company name mapping, please contribute it — that's the most needed thing right now.

---

## Disclaimer

This project scrapes publicly available data from psx.com.pk for educational and developer use. Not affiliated with Pakistan Stock Exchange. Do not use for high-frequency automated trading.

---

## License

MIT
