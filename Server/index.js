require("dotenv").config();
const app = require("./app");
const { connectDB, sequelize } = require("./config/db");

const port = 3000;

const startServer = async () => {
  try {
    await connectDB();

    //await sequelize.sync({ force: true });

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();
