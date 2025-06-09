import bodyParser from "body-parser";
import {Client} from "pg"
import express from "express"
import { error } from "console";
import pg from "pg";
import express from "express";

const db = new Client({
    user:'postgres',
    host:'localhost',
    database:'school',
    password: '123456',
    port: 5432
});

const app = express();
const port = 3000;

app.use(bodyParser.json())

db.connect()
    .then(() => console.log("connected to db"))
    .catch((err)=>{
        console.log("cannot connect to db")
        process.exit(1);
    })

app.get("/studenti", async (req, res) => {
    try{
        const result = await db.query("SELECT * FROM studenti ORDER BY id ASC")
        res.json(result.rows)
    } catch (err){
         console.log("Error GET to studenti table: ", err.stack);
        res.status(400).json({ error: err.message })

    }
})    

app.post("/studenti", async (req, res) => {

    const {ime, prezime, godina_rodjenja, email} = req.body

    if(!ime || !prezime){
        console.log("Data validation failed")
        return res.status(400).json({ error: "Polja ime i prezime su obavezna"})
    }

   try{
    const result = await db.query(
        `INSERT INTO studenti (ime, prezime, godina_rodjenja, email)
         VALUES($1, $2, $3, $4)
         RETURNING *`,
         [ime, prezime, godina_rodjenja, email]
    )
    return res.status(201).json({ error: `Uspisno smo unijeli ${ime}, ${prezime} studenta`})
   }catch(err){
        console.log("Error POSTING to studenti table: ", err.stack);
        res.status(400).json({ error: err.message })
   }
})


app.get("/", async (req, res) => {
    res.send(`
        <h1>CRUD operacije</>
        <ul>
            <li> GET /studenti  - Dohavati sve studente </li>
            <li> POST /studenti  - Upisi novog studenta</li>
        </ul>
    `);
});


app.listen(port, () => {
    console.log("Server run on the http://localhost:" + port)
})