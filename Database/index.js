import express from "express";
import bodyParser from "body-parser";
import { Client } from "pg";

const db = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'school',
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
app.get("/studenti", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM studenti ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.log("Error GET from studenti table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// GET /studenti/:id - Dohvati studenta po ID-u
app.get("/studenti/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM studenti WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student nije pronađen" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.log("Error GET /studenti/:id: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// POST /studenti - Dodavanje novog studenta
app.post("/studenti", async (req, res) => {
    const { ime, prezime, godina_rodjenja, email } = req.body;

    if (!ime || !prezime) {
        console.log("Data validation failed");
        return res.status(400).json({ error: "Polja ime i prezime su obavezna" });
    }

    try {
        const result = await db.query(
            `INSERT INTO studenti (ime, prezime, godina_rodjenja, email)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [ime, prezime, godina_rodjenja, email]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log("Error POST to studenti table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// PUT /studenti/:id - Ažuriranje studenta
app.put("/studenti/:id", async (req, res) => {
    const { id } = req.params;
    const { ime, prezime, godina_rodjenja, email } = req.body;

    try {
        const result = await db.query(
            `UPDATE studenti
             SET ime = $1,
                 prezime = $2,
                 godina_rodjenja = $3,
                 email = $4
             WHERE id = $5
             RETURNING *;`,
            [ime, prezime, godina_rodjenja, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student nije pronađen" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.log("Error PUT to studenti table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// DELETE /studenti/:id - Brisanje studenta
app.delete("/studenti/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM studenti WHERE id = $1 RETURNING *;',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student nije pronađen" });
        }
        res.json({ message: `Student s ID ${id} obrisan.` });
    } catch (err) {
        console.log("Error DELETE from studenti table: ", err.stack);
        res.status(400).json({ error: err.message });
    }
});

// Root ruta
app.get("/", (req, res) => {
    res.send(`
        <h1>CRUD operacije</h1>
        <ul>
            <li>GET /studenti - Dohvati sve studente</li>
            <li>GET /studenti/:id - Dohvati jednog studenta po ID-u</li>
            <li>POST /studenti - Upis novog studenta</li>
            <li>PUT /studenti/:id - Ažuriraj studenta</li>
            <li>DELETE /studenti/:id - Obriši studenta</li>
        </ul>
    `);
});

// Pokretanje servera
app.listen(port, () => {
    console.log(`Server radi na http://localhost:${port}`);
});
