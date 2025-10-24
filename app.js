require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./docs/openapi.json");

const db = require("./db");
const knex = require("knex")(db);

const usersRouter = require("./routes/users");
const sessionsRouter = require("./routes/sessions");
const subjectsRouter = require("./routes/subjects");
const presetsRouter = require("./routes/presets");
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");

const rateLimitMiddleware = require("./middleware/rateLimit");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  req.db = knex;
  next();
});
app.use(helmet());
app.use(cors());

app.use(rateLimitMiddleware);

app.use("/users", usersRouter);
app.use("/sessions", sessionsRouter);
app.use("/subjects", subjectsRouter);
app.use("/presets", presetsRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
