const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// create server with express
const app = express();

// config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// sqllite because i apparently don't know how to write to files
const db_name = path.join(__dirname, "data", "books.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connection refused, 'books.db'");
});

// create table (Book_ID, Title, Author, Comments)
const sql_create = `CREATE TABLE IF NOT EXISTS Books (
  Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Title VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL,
  Comments TEXT
);`;
db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("created the table 'Books'");
  // add to table
  const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, Comments) VALUES
  (1, 'Cracking the Coding Interview', 'Gayle McDowell', '189 Programming Questions & Solutions'),
  (2, 'The Linux Command Line', 'William Schotts', 'A Complete Introduction'),
  (3, 'The C Programming Language', 'Brian W. Kernighan, Dennis M. Ritchie', 'ANSI C');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Cannot add to 'Books'");
  });
});

// serve!
app.listen(3000, () => {
    console.log("check it out at (http://localhost:3000/) !");
});

// GET /
app.get("/", (req, res) => {
  res.render("index");
});

// GET /about
app.get("/about", (req, res) => {
  res.render("about");
});

// GET /contact
app.get("/contact", (req, res) => {
  const contact = {
    Title: "Contact",
    items: ["twitter", "github", "linkedin"]
  };
  res.render("contact", { model: contact });
});

// GET /books
app.get("/books", (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("books", { model: rows });
  });
});

// GET /create
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

// POST /create
app.post("/create", (req, res) => {
  const sql = "INSERT INTO Books (Title, Author, Comments) VALUES (?, ?, ?)";
  const book = [req.body.Title, req.body.Author, req.body.Comments];
  db.run(sql, book, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/books");
  });
});

// GET /edit/5
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { model: row });
  });
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const book = [req.body.Title, req.body.Author, req.body.Comments, id];
  const sql = "UPDATE Books SET Title = ?, Author = ?, Comments = ? WHERE (Book_ID = ?)";
  db.run(sql, book, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/books");
  });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", { model: row });
  });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Books WHERE Book_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/books");
  });
});
