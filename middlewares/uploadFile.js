const multer = require("multer");

module.exports = (image) => {
  // create destination to store file
  const storage = multer.diskStorage({
    // directory destination is uploads folder
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    // new naming file when file is uploaded
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  // file filter so only image are allowed
  const fileFilter = function (req, file, cb) {
    if (file.fieldname === image) {
      if (!file.originalname.match(/\.(jpg|JPG|png|PNG|svg|SVG)$/)) {
        req.fileValidationError = {
          message: "Only image files are allowed",
        };

        // pass an error if files format doesn't match
        return cb(new Error("Only image files are allowed", false));
      }
    }

    // accept the file pass `true`
    cb(null, true);
  };

  // max file size in MB
  const sizeMB = 10;
  const maxSize = sizeMB * 1024 * 1024;

  //upload function
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  }).single(image);

  // error handling when file over the limit
  return (req, res, next) => {
    upload(req, res, function (err) {
      if (err) {
        // specific error handling when limit is over
        if (err.code == "LIMIT_FILE_SIZE") {
          req.session.message = {
            type: "danger",
            message: "Error, max file size is 10MB",
          };
          return res.redirect(req.originalUrl);
        }

        // else error handling
        req.session.message = {
          type: "danger",
          message: "upload file error",
        };
        return res.redirect(req.originalUrl);
      }
      return next();
    });
  };
};
