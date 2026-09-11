require("dotenv").config();
const connectDB = require("./src/config/db");
const createApp = require("./src/app");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () =>
      console.log(`server listening on http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error("server failed to start:", err.message);
    process.exit(1);
  }
};

start();
