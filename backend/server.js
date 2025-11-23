require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { body, query, validationResult } = require("express-validator");
const Database = require("better-sqlite3");

// ---------------- APP SETUP ----------------
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---------------- DB SETUP ------------------
const db = new Database("./inventory.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    unit TEXT,
    category TEXT,
    brand TEXT,
    stock INTEGER NOT NULL,
    status TEXT,
    image TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS inventory_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    old_quantity INTEGER,
    new_quantity INTEGER,
    change_date TEXT,
    user_info TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )
`).run();

const dbAll = (sql, params = []) => db.prepare(sql).all(params);
const dbGet = (sql, params = []) => db.prepare(sql).get(params);
const dbRun = (sql, params = []) => db.prepare(sql).run(params);

// -------------- FILE UPLOAD (CSV) --------------
const upload = multer({ dest: "uploads/" });

// -------------- HEALTH CHECK -------------------
app.get("/", (req, res) => {
  res.json({ status: "Inventory API running" });
});

// -------------- GET PRODUCTS (list + filter + pagination + sort) ----
app.get("/api/products", (req, res) => {
  let {
    page = 1,
    limit = 10,
    name = "",
    category = "",
    sortField = "id",
    sortOrder = "asc",
  } = req.query;

  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const offset = (page - 1) * limit;

  const allowedSort = ["id", "name", "category", "brand", "stock"];
  if (!allowedSort.includes(sortField)) sortField = "id";
  sortOrder = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";

  let where = "WHERE 1=1";
  const params = [];

  if (name) {
    where += " AND LOWER(name) LIKE ?";
    params.push(`%${name.toLowerCase()}%`);
  }
  if (category) {
    where += " AND category = ?";
    params.push(category);
  }

  const sql = `
    SELECT * FROM products
    ${where}
    ORDER BY ${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const rows = dbAll(sql, params);
  res.json(rows); // simple: just send page data
});

// -------------- OPTIONAL SEARCH ENDPOINT ----------------
app.get(
  "/api/products/search",
  [query("name").optional().isString()],
  (req, res) => {
    const name = (req.query.name || "").toLowerCase();
    const rows = dbAll(
      "SELECT * FROM products WHERE LOWER(name) LIKE ?",
      [`%${name}%`]
    );
    res.json(rows);
  }
);

// -------------- ADD NEW PRODUCT ----------------
app.post(
  "/api/products",
  [
    body("name").notEmpty(),
    body("stock").isInt({ min: 0 }).toInt(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, unit, category, brand, stock, image } = req.body;

    const dup = dbGet(
      "SELECT id FROM products WHERE LOWER(name)=LOWER(?)",
      [name]
    );
    if (dup) {
      return res.status(400).json({ error: "Product already exists" });
    }

    const status = stock > 0 ? "In Stock" : "Out of Stock";

    dbRun(
      `INSERT INTO products (name, unit, category, brand, stock, status, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, unit || "", category || "", brand || "", stock, status, image || ""]
    );

    const created = dbGet("SELECT * FROM products WHERE name=?", [name]);
    res.json(created);
  }
);

// -------------- UPDATE PRODUCT + HISTORY ----------------
app.put(
  "/api/products/:id",
  [
    body("name").notEmpty(),
    body("stock").isInt({ min: 0 }).toInt(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { name, unit, category, brand, stock, status, image } = req.body;

    const existing = dbGet("SELECT * FROM products WHERE id=?", [id]);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const dup = dbGet(
      "SELECT id FROM products WHERE LOWER(name)=LOWER(?) AND id!=?",
      [name, id]
    );
    if (dup) {
      return res.status(400).json({ error: "Product name already used" });
    }

    if (existing.stock !== stock) {
      dbRun(
        `INSERT INTO inventory_history
           (product_id, old_quantity, new_quantity, change_date, user_info)
         VALUES (?, ?, ?, ?, ?)`,
        [id, existing.stock, stock, new Date().toISOString(), "admin"]
      );
    }

    const finalStatus =
      status || (stock > 0 ? "In Stock" : "Out of Stock");

    dbRun(
      `UPDATE products
       SET name=?, unit=?, category=?, brand=?, stock=?, status=?, image=?
       WHERE id=?`,
      [name, unit, category, brand, stock, finalStatus, image, id]
    );

    const updated = dbGet("SELECT * FROM products WHERE id=?", [id]);
    res.json(updated);
  }
);

// -------------- DELETE PRODUCT ----------------
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;

  dbRun("DELETE FROM inventory_history WHERE product_id=?", [id]);
  const result = dbRun("DELETE FROM products WHERE id=?", [id]);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json({ success: true });
});

// -------------- INVENTORY HISTORY ----------------
app.get("/api/products/:id/history", (req, res) => {
  const { id } = req.params;
  const rows = dbAll(
    "SELECT * FROM inventory_history WHERE product_id=? ORDER BY change_date DESC",
    [id]
  );
  res.json(rows);
});

// -------------- IMPORT CSV ----------------
app.post("/api/products/import", upload.single("csvFile"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "CSV required" });

  const filePath = path.resolve(req.file.path);
  const rows = [];

  let added = 0;
  let skipped = 0;
  const duplicates = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => rows.push(row))
    .on("end", () => {
      rows.forEach((r) => {
        const name = (r.name || "").trim();
        if (!name) {
          skipped++;
          return;
        }

        const exists = dbGet(
          "SELECT id FROM products WHERE LOWER(name)=LOWER(?)",
          [name]
        );
        if (exists) {
          skipped++;
          duplicates.push({ name, existingId: exists.id });
          return;
        }

        const stock = Number(r.stock || 0);
        const status =
          (r.status && r.status.trim()) ||
          (stock > 0 ? "In Stock" : "Out of Stock");

        dbRun(
          `INSERT INTO products (name, unit, category, brand, stock, status, image)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            r.unit || "",
            r.category || "",
            r.brand || "",
            stock,
            status,
            r.image || "",
          ]
        );
        added++;
      });

      fs.unlinkSync(filePath);
      res.json({ added, skipped, duplicates });
    });
});

// -------------- EXPORT CSV ----------------
app.get("/api/products/export", (req, res) => {
  const rows = dbAll("SELECT * FROM products", []);

  const header = "id,name,unit,category,brand,stock,status,image\n";
  const csvBody = rows
    .map((p) =>
      [p.id, p.name, p.unit, p.category, p.brand, p.stock, p.status, p.image]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="products.csv"'
  );
  res.send(header + csvBody);
});

// -------------- START ----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
