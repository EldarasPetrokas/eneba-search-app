require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

function normalizeSearch(s) {
  const q = String(s || "").toLowerCase().trim();
  if (!q) return q;

  const aliases = {
    rdr2: "red dead redemption 2",
    "reddead2": "red dead redemption 2",
    fifa: "fifa 23",
    fifa23: "fifa 23",
    split: "split fiction",
  };

  return aliases[q] || q;
}

app.get("/list", async (req, res) => {
  const raw = String(req.query.search ?? "").trim();
  const search = normalizeSearch(raw);

  try {
    if (!search) {
      const result = await pool.query(`
        select
          id,
          name,
          image_url as "imageUrl",
          price_eur as "priceEur",
          cashback_percent as "cashbackPercent",
          platform,
          region,
          store
        from public.games
        order by created_at desc
        limit 30;
      `);
      return res.json(result.rows);
    }

    const result = await pool.query(
      `
      select
        id,
        name,
        image_url as "imageUrl",
        price_eur as "priceEur",
        cashback_percent as "cashbackPercent",
        platform,
        region,
        store,
        similarity(name, $1) as score
      from public.games
      where
        similarity(name, $1) > 0.10
        or name ilike '%' || $1 || '%'
      order by
        score desc,
        name asc
      limit 30;
      `,
      [search]
    );

    const clean = result.rows.map(({ score, ...rest }) => rest);
    return res.json(clean);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
