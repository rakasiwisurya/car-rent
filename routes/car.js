const router = require("express").Router();

// import db connection
const dbConnection = require("../connection/db");
const uploadFile = require("../middlewares/uploadFile");
const pathFile = "http://localhost:3000/uploads/";

// render car add form page
router.get("/add", function (req, res) {
  const types = [];
  const brands = [];

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    const query = "SELECT * FROM tb_type";

    conn.query(query, (err, results) => {
      if (err) throw err;

      for (let result of results) {
        types.push({
          ...result,
        });
      }
    });

    conn.release();
  });

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    const query = "SELECT * FROM tb_brand";

    conn.query(query, (err, results) => {
      if (err) throw err;

      for (let result of results) {
        brands.push({
          ...result,
        });
      }
    });

    conn.release();
  });

  res.render("car-rent/car/form-add", {
    title: "Form Add Car",
    isLogin: req.session.isLogin,
    types,
    brands,
  });
});

router.get("/edit/:id", function (req, res) {
  const { id } = req.params;

  if (!req.session.isLogin) {
    req.session.message = {
      type: "danger",
      message: "you must login first",
    };

    return res.redirect("/login");
  }
  const query = "SELECT * FROM tb_car WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      if (req.session.user.status != 1) {
        req.session.message = {
          type: "danger",
          message: "you're not the owner of this car rent",
        };
        return res.redirect("/");
      }

      const car = {
        ...results[0],
        image: pathFile + results[0].photo,
        // content: results[0].content.replace(/(<br><br>)/g, "\r\n"),
      };

      req.session.message = {
        type: "success",
        message: "edit car successfully",
      };
      res.render("car-rent/car/form-edit", {
        title: "Form Edit Car",
        isLogin: req.session.isLogin,
        car,
      });
    });

    conn.release();
  });
});

// render car page
router.post("/", uploadFile("image"), function (req, res) {
  let { type_id, brand_id, name, plat_number, price } = req.body;
  let image = req.file.filename;
  const status = "1";

  const query =
    "INSERT INTO tb_car (type_id, brand_id, name, plat_number, price, photo, status) VALUES (?,?,?,?,?,?,?)";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(
      query,
      [type_id, brand_id, name, plat_number, price, image, status],
      (err, result) => {
        if (err) {
          req.session.message = {
            type: "danger",
            message: "server error",
          };
          res.redirect("/car/add");
        } else {
          req.session.message = {
            type: "success",
            message: "add car successfully",
          };

          res.redirect(`/car/${result.insertId}`);
        }
      }
    );

    conn.release();
  });
});

router.post("/edit/:id", uploadFile("image"), function (req, res) {
  let { id, type_id, brand_id, name, plat_number, price, oldImage } = req.body;

  let image = oldImage.replace(pathFile, "");

  if (req.file) {
    image = req.file.filename;
  }

  const query =
    "UPDATE tb_car SET type_id = ?, brand_id = ?, name = ?, plat_number = ?, price = ?, photo = ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(
      query,
      [type_id, brand_id, name, plat_number, price, image, id],
      (err, results) => {
        if (err) {
          req.session.message = {
            type: "danger",
            message: err.message,
          };
          res.redirect(`/car/${id}`);
        }
        res.redirect(`/car/${id}`);
      }
    );

    conn.release();
  });
});

// handle delete car
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_car WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/");
      }

      req.session.message = {
        type: "success",
        message: "car successfully deleted",
      };
      res.redirect("/");
    });

    conn.release();
  });
});

// render detail cars page
router.get("/:id", function (req, res) {
  const { id } = req.params;

  const query = "SELECT * FROM tb_car WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) throw err;
      const car = {
        ...results[0],
        image: pathFile + results[0].photo,
      };

      console.log(results[0]);

      // initialize statement for car owner
      let isCarRentOwner = false;

      if (req.session.isLogin) {
        if (req.session.user.status == 1) {
          isCarRentOwner = true;
        }
      }

      res.render("car-rent/detail", {
        title: "Car Detail",
        isLogin: req.session.isLogin,
        car,
        isCarRentOwner,
      });
    });

    conn.release();
  });
});

module.exports = router;
