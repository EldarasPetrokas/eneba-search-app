// 1) Užkraunam .env failą į process.env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// 2) Middleware: leidžia priimti JSON body (čia labiau POST/PUT, bet paliekam)
app.use(express.json());

// 3) CORS: leidžiam užklausas iš frontend'o domeno (lokaliai: http://localhost:5173)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// 4) DB connection pool (efektyvu: nekuria naujos jungties kiekvienam request)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 5) Health endpointas: greitas patikrinimas ar serveris ir DB gyvi
app.get("/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: "DB connection failed" });
  }
});

/**
 * 6) Reikalaujamas endpointas:
 * GET /list
 * GET /list?search=<gamename>
 */
app.get("/list", async (req, res) => {
  const search = (req.query.search ?? "").toString().trim();

  try {
    // Jei search tuščias - grąžinam default list (pvz 30)
    if (!search) {
      const q = `
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
      `;
      const result = await pool.query(q);
      return res.json(result.rows);
    }

    // Jei yra search - fuzzy paieška (pg_trgm)
    const q = `
      select
        id,
        name,
        image_url as "imageUrl",
        price_eur as "priceEur",
        cashback_percent as "cashbackPercent",
        platform,
        region,
        store,
        greatest(similarity(name, $1), 0) as score
      from public.games
      where name % $1 OR name ilike '%' || $1 || '%'
      order by score desc, name asc
      limit 30;
    `;

    const result = await pool.query(q, [search]);

    // score UI nereikia - išmetam
    const clean = result.rows.map(({ score, ...rest }) => rest);
    return res.json(clean);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 7) Paleidžiam serverį
const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
