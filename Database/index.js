import express from "express";
import bodyParser from "body-parser";
import { Client } from "pg";

const db = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Library',
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

// GET /studenti - Dohvati sve studente
app.get("/knjige", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM knjige ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.log("Error GET from knjige table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// GET /knjige/:id - Dohvati knjigu po ID-u
app.get("/knjige/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM knjige WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "knjiga nije pronađena" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.log("Error GET /knjige/:id: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// POST /knjige - Dodavanje nove knjige
app.post("/knjige", async (req, res) => {
    const { naslov, autor, godina_izdanja, zanr } = req.body;

    if (!naslov || !autor) {
        console.log("Data validation failed");
        return res.status(400).json({ error: "Polja naslov i autor su obavezna" });
    }

    try {
        const result = await db.query(
            `INSERT INTO knjige (naslov, autor, godina_izdanja, zanr)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [naslov, autor, godina_izdanja, zanr]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log("Error POST to knjige table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// PUT /knjige/:id - Ažuriranje knjige
app.put("/knjige/:id", async (req, res) => {
    const { id } = req.params;
    const { naslov, autor, godina_izdanja, zanr } = req.body;

    try {
        const result = await db.query(
            `UPDATE knjige
             SET naslov = $1,
                 autor = $2,
                 godina_izdanja = $3,
                 zanr = $4
             WHERE id = $5
             RETURNING *;`,
            [naslov, autor, godina_izdanja, zanr, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Knjiga nije pronađena" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.log("Error PUT to knjige table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// DELETE /knjige/:id - Brisanje knjige
app.delete("/knjige/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM knjige WHERE id = $1 RETURNING *;',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Knjiga nije pronađena" });
        }
        res.json({ message: `Knjiga s ID ${id} obrisana.` });
    } catch (err) {
        console.log("Error DELETE from knjige table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// Root ruta
app.get("/", (req, res) => {
    res.send(`
        <h1>CRUD operacije</h1>
        <ul>
            <li>GET /knjige ---------- Dohvati sve knjige</li>
            <li>GET /knjige/:id ------ Dohvati jednu knjigu po ID-u</li>
            <li>POST /knjige --------- Upis nove knjige</li>
            <li>PUT /knjige/:id ------ Ažuriraj knjigu</li>
            <li>DELETE /knjige/:id --- Obriši knjigu</li>
        </ul>
    `);
});

// Pokretanje servera
app.listen(port, () => {
    console.log(`Server radi na http://localhost:${port}`);
});
