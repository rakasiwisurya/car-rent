const router = require("express").Router();

// import db connection
const dbConnection = require("../connection/db");

// render rent page
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

    if (isCarRentOwner) {
      const queryRent =
        "SELECT tb_rent.*, tb_car.name AS carName, tb_user.name AS userName FROM tb_rent INNER JOIN tb_car ON tb_car.id = tb_rent.car_id INNER JOIN tb_user ON tb_user.id = tb_rent.user_id ORDER BY tb_rent.created_at DESC";

      conn.query(queryRent, (err, results) => {
        if (err) throw err;

        const rents = [];

        for (let i = 0; i < results.length; i++) {
          const result = results[i];

          let no = i + 1;
          let borrowDate = result.borrow_date.toLocaleDateString("id-ID");
          let returnDate = null;

          if (result.return_date != null) {
            returnDate = result.return_date.toLocaleDateString("id-ID");
          }

          rents.push({
            ...result,
            no,
            borrowDate,
            returnDate,
            isCarRentOwner,
          });
        }

        res.render("car-rent/rent/index", {
          title: "Rent",
          isLogin: req.session.isLogin,
          username: req.session.user.name,
          isCarRentOwner,
          rents,
        });
      });
      conn.release();
    } else {
      const queryRent =
        "SELECT tb_rent.*, tb_car.name AS carName, tb_user.name AS userName FROM tb_rent INNER JOIN tb_car ON tb_car.id = tb_rent.car_id INNER JOIN tb_user ON tb_user.id = tb_rent.user_id WHERE tb_rent.user_id = ? ORDER BY tb_rent.borrow_date DESC";

      conn.query(queryRent, [req.session.user.id], (err, results) => {
        if (err) throw err;

        for (let i = 0; i < results.length; i++) {
          const result = results[i];

          let no = i + 1;
          let borrowDate = result.borrow_date.toLocaleDateString("id-ID");
          let returnDate = null;

          if (result.return_date != null) {
            returnDate = result.return_date.toLocaleDateString("id-ID");
          }

          rents.push({
            ...result,
            no,
            borrowDate,
            returnDate,
            isCarRentOwner,
          });
        }

        res.render("car-rent/rent/index", {
          title: "Rent",
          isLogin: req.session.isLogin,
          username: req.session.user.name,
          isCarRentOwner,
          rents,
        });
      });
      conn.release();
    }
  });
});

// render rent add form page
router.get("/add", function (req, res) {
  res.render("car-rent/rent/form-add", {
    title: "Add Rent",
    isLogin: req.session.isLogin,
  });
});

// render rent edit form page
router.get("/edit/:id", function (req, res) {
  const { id } = req.params;

  if (!req.session.isLogin) {
    req.session.message = {
      type: "danger",
      message: "you must login first",
    };

    return res.redirect("/login");
  }
  const query = "SELECT * FROM tb_rent WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      let borrowDate = results[0].borrow_date.toISOString().split("T")[0];
      let returnDate = null;
      if (results[0].return_date != null) {
        returnDate = results[0].return_date.toISOString().split("T")[0];
      }

      if (req.session.user.status != 1) {
        req.session.message = {
          type: "danger",
          message: "you're not the owner of this rent rent",
        };
        return res.redirect("/");
      }

      const rent = {
        ...results[0],
        borrowDate,
        returnDate,
      };

      res.render("car-rent/rent/form-edit", {
        title: "Edit Rent",
        isLogin: req.session.isLogin,
        rent,
      });
    });

    conn.release();
  });
});

// render rent page
router.post("/add", function (req, res) {
  let { car_id, sub_total } = req.body;

  let today = new Date();
  let user_id = req.session.user.id;
  let status = "0";
  let borrow_date = today;

  // console.log(borrow_date);

  const queryInsert =
    "INSERT INTO tb_rent (car_id, user_id, borrow_date, sub_total) VALUES (?,?,?,?)";

  const queryUpdate = "UPDATE tb_car SET status = ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(
      queryInsert,
      [car_id, user_id, borrow_date, sub_total],
      (err, result) => {
        if (err) {
          req.session.message = {
            type: "danger",
            message: err.message,
          };
          res.redirect("/");
        }

        conn.query(queryUpdate, [status, car_id], (err, results) => {
          if (err) {
            req.session.message = {
              type: "danger",
              message: err.message,
            };
            res.redirect(`/`);
          }
        });
        conn.release();
      }
    );
    conn.release();
  });

  req.session.message = {
    type: "success",
    message: "Rent Car Successfully",
  };
  res.redirect(`/`);
});

router.post("/return", function (req, res) {
  let { car_id } = req.body;

  let return_date = new Date(); // today
  let status = "1";

  const queryInsertReturn =
    "UPDATE tb_rent SET return_date = ? WHERE car_id = ?";

  const queryUpdateStatus = "UPDATE tb_car SET status = ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(queryInsertReturn, [return_date, car_id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect(`/`);
      }

      conn.query(queryUpdateStatus, [status, car_id], (err, results) => {
        if (err) {
          req.session.message = {
            type: "danger",
            message: err.message,
          };
          res.redirect(`/`);
        }
      });
      conn.release();
    });
    conn.release();
  });

  req.session.message = {
    type: "success",
    message: "Return Car Succesfully",
  };
  res.redirect(`/`);
});

router.post("/edit/:id", function (req, res) {
  let { id, car_id, borrow_date, return_date, sub_total } = req.body;

  let user_id = req.session.user.id;

  const query =
    "UPDATE tb_rent SET car_id = ?, user_id = ?, borrow_date = ?, return_date = ?, sub_total = ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(
      query,
      [car_id, user_id, borrow_date, return_date, sub_total, id],
      (err, results) => {
        if (err) {
          req.session.message = {
            type: "danger",
            message: err.message,
          };
          res.redirect(`/rent/edit/${id}`);
        } else {
          req.session.message = {
            type: "success",
            message: "edit rent successfully",
          };
          res.redirect(`/rent`);
        }
      }
    );

    conn.release();
  });
});

// handle delete rent
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_rent WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/rent");
      }

      req.session.message = {
        type: "success",
        message: "rent successfully deleted",
      };
      res.redirect("/rent");
    });

    conn.release();
  });
});

module.exports = router;
