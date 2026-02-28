const express = require("express");
const cors = require("cors");

const userRouter = require("./routes/user.route");
const roomRouter = require("./routes/room.route");
const scheduleRouter = require("./routes/schedule.route");
const mapsRouter = require("./routes/maps.route");
require("./models/associations");

const app = express();

const helmet = require("helmet");
app.use(helmet());

app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/maps", mapsRouter);

module.exports = app;
