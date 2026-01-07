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

function normalizeRaw(raw) {
  return String(raw || "").trim().toLowerCase();
}

function aliasToCanonical(q) {
  const aliases = {
    rdr: "red dead redemption 2",
    rdr2: "red dead redemption 2",
    "reddead2": "red dead redemption 2",
    fifa: "fifa 23",
    fifa23: "fifa 23",
    split: "split fiction",
  };
  return aliases[q] || null;
}

function similarityThreshold(q) {
  const len = q.length;

  // trumpiems query similarity yra “triukšmingas”
  if (len <= 3) return 0.35;
  if (len <= 6) return 0.25;
  return 0.15;
}

app.get("/list", async (req, res) => {
  const raw = normalizeRaw(req.query.search);
  if (!raw) {
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

  try {
    // 1) Alias mode: jei žmogus įveda rdr/rdr2/fifa ir pan. — grąžinam tikslinį žaidimą
    const canonical = aliasToCanonical(raw);
    if (canonical) {
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
          store
        from public.games
        where lower(name) = $1
        limit 10;
        `,
        [canonical]
      );

      // jei dėl kažkokių priežasčių nerastų exact (pvz. DB name kitoks),
      // tada fallback į ilike
      if (result.rows.length > 0) return res.json(result.rows);

      const fallback = await pool.query(
        `
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
        where name ilike '%' || $1 || '%'
        order by name asc
        limit 30;
        `,
        [canonical]
      );
      return res.json(fallback.rows);
    }

    // 2) Normal search:
    // - ilike visada gerai “tikram” substring search
    // - similarity naudojam tik su adekvačiu slenksčiu
    const thresh = similarityThreshold(raw);

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
        name ilike '%' || $1 || '%'
        or similarity(name, $1) >= $2
      order by
        (case when name ilike '%' || $1 || '%' then 1 else 0 end) desc,
        score desc,
        name asc
      limit 30;
      `,
      [raw, thresh]
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
