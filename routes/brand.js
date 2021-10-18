const router = require("express").Router();

// import db connection
const dbConnection = require("../connection/db");

// render brand page
router.get("/", function (req, res) {
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

    const queryBrand = "SELECT * FROM tb_brand ORDER BY created_at ASC";

    conn.query(queryBrand, (err, results) => {
      if (err) throw err;

      const brands = [];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        let no = i + 1;

        brands.push({
          ...result,
          no,
        });
      }

      res.render("car-rent/brand/index", {
        title: "Brand",
        isLogin: req.session.isLogin,
        username: req.session.user.name,
        isCarRentOwner,
        brands,
      });
    });

    conn.release();
  });
});

// render brand add form page
router.get("/add", function (req, res) {
  res.render("car-rent/brand/form-add", {
    title: "Add Car Brand",
    isLogin: req.session.isLogin,
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

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    const query = "SELECT * FROM tb_brand WHERE id = ?";

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      if (req.session.user.status != 1) {
        req.session.message = {
          type: "danger",
          message: "you're not the owner of this car rent",
        };
        return res.redirect("/");
      }

      const brand = {
        ...results[0],
      };

      res.render("car-rent/brand/form-edit", {
        title: "Edit Car brand",
        isLogin: req.session.isLogin,
        brand,
      });
    });

    conn.release();
  });
});

// render type page
router.post("/add", function (req, res) {
  let { name } = req.body;

  const query = "INSERT INTO tb_brand (name) VALUES (?)";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [name], (err, result) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "server error",
        };
        res.redirect("/brand");
      } else {
        req.session.message = {
          type: "success",
          message: "add brand successfully",
        };

        res.redirect("/brand");
      }
    });

    conn.release();
  });
});

router.post("/edit/:id", function (req, res) {
  let { id, name } = req.body;

  const query = "UPDATE tb_brand SET name = ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [name, id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect(`/brand/edit/${id}`);
      } else {
        req.session.message = {
          type: "success",
          message: "edit brand successfully",
        };
        res.redirect("/brand");
      }
    });

    conn.release();
  });
});

// handle delete type
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_brand WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/brand");
      }

      req.session.message = {
        type: "success",
        message: "brand successfully deleted",
      };
      res.redirect("/brand");
    });

    conn.release();
  });
});

module.exports = router;
