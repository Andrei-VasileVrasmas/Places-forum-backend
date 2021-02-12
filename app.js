const express = require("express");
const bodyParser = require("body-parser");

const placeRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placeRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw (error = new HttpError("Could not find this route...", 404));
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "Unknown error occured..." });
});

app.listen(5000, () => {
  console.log(`Server running on port 5000...`);
});
