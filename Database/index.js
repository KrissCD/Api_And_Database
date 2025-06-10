import express from "express";
import bodyParser from "body-parser";
import { Client } from "pg";
import apiRouter from './routes/api.js';

const db = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'ZadatakBaze',
    password: '1234',
    port: 5432
});

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Povezivanje na bazu
db.connect()
    .then(() => console.log("Connected to DB"))
    .catch((err) => {
        console.log("Cannot connect to DB", err.stack);
        process.exit(1);
    });

// GET /stores - Dohvati sve trgovine
app.get("/stores", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                s.id AS store_id,
                s.name AS store_name,
                i.id AS item_id,
                i.name AS item_name,
                i.price AS item_price
            FROM stores s
            LEFT JOIN items i ON i.store_id = s.id
            ORDER BY s.id, i.id
        `);

        const storesMap = {};

        result.rows.forEach(row => {
            const storeId = row.store_id;

            if (!storesMap[storeId]) {
                storesMap[storeId] = {
                    id: storeId,
                    name: row.store_name,
                    items: []
                };
            }

            if (row.item_id) {
                storesMap[storeId].items.push({
                    id: row.item_id,
                    name: row.item_name,
                    price: row.item_price
                });
            }
        });

        const storesArray = Object.values(storesMap);
        res.json(storesArray);

    } catch (err) {
        console.log("Error GET /stores: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// GET /items - Dohvati stavku po ID-u
app.get("/items", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                i.id AS item_id,
                i.name AS item_name,
                i.price AS item_price,
                s.id AS store_id,
                s.name AS store_name
            FROM items i
            JOIN stores s ON i.store_id = s.id
            ORDER BY i.id
        `);

        const items = result.rows.map(row => ({
            id: row.item_id,
            name: row.item_name,
            price: row.item_price,
            store: {
                id: row.store_id,
                name: row.store_name
            }
        }));

        res.json(items);
    } catch (err) {
        console.log("Error GET /items: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});



// GET /stores/:id - Dohvati trgovinu po ID-u
app.get("/stores/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Get store data
        const storeResult = await db.query(`SELECT id, name FROM stores WHERE id = $1`, [id]);

        if (storeResult.rows.length === 0) {
            return res.status(404).json({ error: "Trgovina nije pronađena" });
        }

        const store = storeResult.rows[0];

        // Get items for the store
        const itemsResult = await db.query(
            `SELECT id, name, price FROM items WHERE store_id = $1 ORDER BY id`,
            [id]
        );

        // Get tags for the store
        const tagsResult = await db.query(
            `SELECT id, name FROM tags WHERE store_id = $1 ORDER BY id`,
            [id]
        );

        res.json({
            id: store.id,
            name: store.name,
            items: itemsResult.rows,
            tags: tagsResult.rows
        });
    } catch (err) {
        console.log("Error GET /stores/:id: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});


// GET /items/:id - Dohvati stavku po ID-u
app.get("/items/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Get item with store info
        const itemResult = await db.query(`
            SELECT
                i.id AS item_id,
                i.name AS item_name,
                i.price AS item_price,
                s.id AS store_id,
                s.name AS store_name
            FROM items i
            JOIN stores s ON i.store_id = s.id
            WHERE i.id = $1
        `, [id]);

        if (itemResult.rows.length === 0) {
            return res.status(404).json({ error: "Stavka nije pronađena" });
        }

        const row = itemResult.rows[0];

        // Get tags for the item
        const tagsResult = await db.query(`
            SELECT t.id, t.name
            FROM tags t
            JOIN items_tags it ON it.tag_id = t.id
            WHERE it.item_id = $1
            ORDER BY t.id
        `, [id]);

        // Build response object
        const item = {
            id: row.item_id,
            name: row.item_name,
            price: row.item_price,
            store: {
                id: row.store_id,
                name: row.store_name
            },
            tags: tagsResult.rows
        };

        res.json(item);
    } catch (err) {
        console.log("Error GET /items/:id: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// POST /items - Dodavanje nove stavke
app.post("/items", async (req, res) => {
    const { name, price, store_id } = req.body;

    if (!name || !price || !store_id) {
        console.log("Data validation failed");
        return res.status(400).json({ error: "Polja name, price i store_id su obavezna" });
    }

    try {
        // Insert the item
        const insertResult = await db.query(
            `INSERT INTO items (name, price, store_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, price, store_id]
        );

        const newItem = insertResult.rows[0];

        // Fetch the store data
        const storeResult = await db.query(
            `SELECT id, name FROM stores WHERE id = $1`,
            [store_id]
        );

        const store = storeResult.rows[0];

        res.status(201).json({
            id: newItem.id,
            name: newItem.name,
            price: newItem.price,
            store: {
                id: store.id,
                name: store.name
            }
        });

    } catch (err) {
        console.log("Error POST to items table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});


// POST /stores - Dodavanje nove trgovine
app.post("/stores", async (req, res) => {
    const { name } = req.body;

    if (!name) {
        console.log("Data validation failed");
        return res.status(400).json({ error: "Polje 'name' je obavezno" });
    }

    try {
        const result = await db.query(
            `INSERT INTO stores (name)
             VALUES ($1)
             RETURNING *`,
            [name]
        );

        const newStore = result.rows[0];

        res.status(201).json({
            id: newStore.id,
            name: newStore.name,
            items: [],
            tags: []
        });
    } catch (err) {
        console.log("Error POST to stores table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});


// PUT /items/:id - Ažuriranje stavke
app.put("/items/:id", async (req, res) => {
    const { id } = req.params;
    const { name, price, store_id } = req.body;

    if (!name || !price || !store_id) {
        console.log("Data validation failed");
        return res.status(400).json({ error: "Polja name, price i store_id su obavezna" });
    }

    try {
        // Update the item
        const updateResult = await db.query(
            `UPDATE items
             SET name = $1, price = $2, store_id = $3
             WHERE id = $4
             RETURNING *`,
            [name, price, store_id, id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: "Stavka nije pronađena" });
        }

        const updatedItem = updateResult.rows[0];

        // Get store data
        const storeResult = await db.query(
            `SELECT id, name FROM stores WHERE id = $1`,
            [store_id]
        );

        const store = storeResult.rows[0];

        // Get tags for the item
        const tagsResult = await db.query(
            `SELECT t.id, t.name
             FROM tags t
             JOIN items_tags it ON it.tag_id = t.id
             WHERE it.item_id = $1
             ORDER BY t.id`,
            [id]
        );

        // Return formatted result
        res.json({
            id: updatedItem.id,
            name: updatedItem.name,
            price: updatedItem.price,
            store: {
                id: store.id,
                name: store.name
            },
            tags: tagsResult.rows
        });

    } catch (err) {
        console.log("Error PUT /items/:id: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});


// PUT /stores/:id - Ažuriranje stavke
app.put("/stores/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        console.log("Data validation failed");
        return res.status(400).json({ error: "Polje 'name' je obavezno" });
    }

    try {
        // Update the store
        const updateResult = await db.query(
            `UPDATE stores
             SET name = $1
             WHERE id = $2
             RETURNING *`,
            [name, id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: "Trgovina nije pronađena" });
        }

        const updatedStore = updateResult.rows[0];

        // Get items and tags for the updated store
        const itemsResult = await db.query(
            `SELECT id, name, price FROM items WHERE store_id = $1 ORDER BY id`,
            [id]
        );

        const tagsResult = await db.query(
            `SELECT id, name FROM tags WHERE store_id = $1 ORDER BY id`,
            [id]
        );

        // Return the full structure
        res.json({
            id: updatedStore.id,
            name: updatedStore.name,
            items: itemsResult.rows,
            tags: tagsResult.rows
        });

    } catch (err) {
        console.log("Error PUT /stores/:id: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});


// DELETE /items/:id - Brisanje stavke
app.delete("/items/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM items WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "stavka nije pronađena" });
        }
        res.json({ message: "Stavka obrisana", item: result.rows[0] });
    } catch (err) {
        console.log("Error DELETE /items/:id: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// DELETE /stores/:id - Brisanje trgovine
app.delete("/stores/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM stores WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "trgovina nije pronađena" });
        }
        res.json({ message: "Trgovina obrisana", store: result.rows[0] });
    } catch (err) {
        console.log("Error DELETE /stores/:id: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// Mount the API router under /api
app.use("/api", apiRouter);

// Root ruta
app.get("/", (req, res) => {
    res.send(`
        <h1>CRUD operacije (API)</h1>
        <ul>
            <li>GET /items ---------- Dohvati sve stavke</li>
            <li>GET /items/:id ------ Dohvati jednu stavku po ID-u</li>
            <li>POST /items --------- Upis nove stavke</li>
            <li>PUT /items/:id ------ Ažuriraj stavku</li>
            <li>DELETE /items/:id --- Obriši stavku</li>
            <li>GET /stores ---------- Dohvati sve trgovine</li>
            <li>GET /stores/:id ------ Dohvati jednu trgovinu po ID-u</li>
            <li>POST /stores --------- Upis nove trgovine</li>
            <li>PUT /stores/:id ------ Ažuriraj trgovinu</li>
            <li>DELETE /stores/:id --- Obriši trgovinu</li>
        </ul>
    `);
});

// Pokretanje servera
app.listen(port, () => {
    console.log(`Server radi na http://localhost:${port}`);
});
