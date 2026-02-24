require("dotenv").config();
const app = require("./app");
const { connectDB, sequelize } = require("./config/db");

const port = 3000;

const startServer = async () => {
  try {
    await connectDB();
    //await sequelize.sync({ force: true });
    await sequelize.sync();

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();
