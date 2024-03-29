"use strict";
// --express config
var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
var path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const FabricConfig = require("./bin/FabricConfig");
const cors = require("cors");

const fabric = new FabricConfig();
fabric.setConfig();


var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

const indexRouter = require("./routes/index");
const userRouter = require("./routes/user/users");
const docsRouter = require("./routes/docs");
const documentRouter = require("./routes/document/document")
const travelRouter = require("./routes/travel/travel");

// routers list
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/upload", docsRouter);
app.use('/document', documentRouter);
app.use("/travel", travelRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
module.exports = app;
