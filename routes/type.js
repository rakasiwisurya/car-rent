const router = require("express").Router();

// import db connection
const dbConnection = require("../connection/db");

// render type add form page
router.get("/add", function (req, res) {
  res.render("car-rent/type/form-add", {
    title: "Add Car Type",
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
  const query = "SELECT * FROM tb_type WHERE id = ?";

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

      const typeCar = {
        ...results[0],
      };

      req.session.message = {
        type: "success",
        message: "edit type successfully",
      };

      res.render("car-rent/type/form-edit", {
        title: "Edit Car Type",
        isLogin: req.session.isLogin,
        typeCar,
      });
    });

    conn.release();
  });
});

// render type page
router.post("/", function (req, res) {
  let { name } = req.body;

  console.log(req.body);

  const query = "INSERT INTO tb_type (name) VALUES (?)";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [name], (err, result) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/type/add");
      } else {
        req.session.message = {
          type: "success",
          message: "add type successfully",
        };

        res.redirect(`/`);
      }
    });

    conn.release();
  });
});

router.post("/edit/:id", function (req, res) {
  let { id, name } = req.body;

  const query = "UPDATE tb_type SET name = ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [name, id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect(`/type/edit/${id}`);
      }
      res.redirect(`/type/edit/${id}`);
    });

    conn.release();
  });
});

// handle delete type
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_type WHERE id = ?";

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
        message: "type successfully deleted",
      };
      res.redirect("/");
    });

    conn.release();
  });
});

module.exports = router;
