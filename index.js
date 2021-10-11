// import package
const http = require("http");
const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");

const app = express();
const hbs = require("hbs");

const authRoute = require("./routes/auth");
const typeRoute = require("./routes/type");
const brandRoute = require("./routes/brand");
const carRoute = require("./routes/car");
const rentRoute = require("./routes/rent");

// import db connection
const dbConnection = require("./connection/db");

// app.use(express.static('express'))
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// html form parser
app.use(express.urlencoded({ extended: false }));

// set views location to app
app.set("views", path.join(__dirname, "views"));

// set template/view engine
app.set("view engine", "hbs");

// register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

// user session
app.use(
  session({
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(), // the session store instance, defaults to a new MemoryStore instance
    saveUninitialized: true, // forces a session that is "uninitialized" to be saved to the store
    resave: false, // forces the session to be saved back to the session store
    secret: "secretValue",
  })
);

// use flash for sending message
app.use(flash());

// setup flash message
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// render index page
app.get("/", function (req, res) {
  let cars = [];
  let renteds = [];
  let isCarRentOwner = false;

  if (req.session.isLogin) {
    if (req.session.user.status == 1) {
      isCarRentOwner = true;
    }
  }

  if (!req.session.isLogin) {
    return res.redirect("/login");
  }

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    const queryAvailable =
      "SELECT * FROM tb_car WHERE status = '1' ORDER BY created_at DESC";

    conn.query(queryAvailable, (err, results) => {
      if (err) throw err;

      for (let result of results) {
        cars.push({
          ...result,
          image: "http://localhost:3000/uploads/" + result.photo,
        });
      }
    });

    conn.release();
  });

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    const queryRented =
      "SELECT * FROM tb_car WHERE status = '0' ORDER BY created_at DESC";

    conn.query(queryRented, (err, results) => {
      if (err) throw err;

      for (let result of results) {
        renteds.push({
          ...result,
          image: "http://localhost:3000/uploads/" + result.photo,
        });
      }
    });

    conn.release();
  });

  res.render("index", {
    title: "Car Rent",
    isLogin: req.session.isLogin,
    username: req.session.user.name,
    isCarRentOwner,
    cars,
    renteds,
  });
});

// mount auth route
app.use("/", authRoute);

// mount type route
app.use("/type", typeRoute);

// mount brand route
app.use("/brand", brandRoute);

// mount car route
app.use("/car", carRoute);

// mount rent route
app.use("/rent", rentRoute);

// create server app with port 3000
const server = http.createServer(app);
const port = 3000;
server.listen(port, () => {
  console.log(`server running on port: http://localhost:${port}`);
});
