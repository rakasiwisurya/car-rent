const router = require("express").Router();

// import db connection
const dbConnection = require("../connection/db");

// render type page
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

    const types = [];

    const queryType = "SELECT * FROM tb_type ORDER BY created_at ASC";

    conn.query(queryType, (err, results) => {
      if (err) throw err;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        let no = i + 1;

        types.push({
          ...result,
          no,
        });
      }
    });

    res.render("car-rent/type/index", {
      title: "Type",
      isLogin: req.session.isLogin,
      username: req.session.user.name,
      isCarRentOwner,
      types,
    });

    conn.release();
  });
});

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
router.post("/add", function (req, res) {
  let { name } = req.body;

  const query = "INSERT INTO tb_type (name) VALUES (?)";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [name], (err, result) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "server error",
        };
        res.redirect("/type");
      } else {
        req.session.message = {
          type: "success",
          message: "add type successfully",
        };

        res.redirect("/type");
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
      } else {
        req.session.message = {
          type: "success",
          message: "edit type successfully",
        };
        res.redirect("/type");
      }
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
        res.redirect("/type");
      }

      req.session.message = {
        type: "success",
        message: "type successfully deleted",
      };
      res.redirect("/type");
    });

    conn.release();
  });
});

module.exports = router;
