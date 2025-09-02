const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dbConnection = require("./config/db");

// Import routes
const userRoutes = require("./routes/user_routes");
const serviceRoutes = require("./routes/serviceRoutes");
const vendorRoutes = require("./routes/vendor_routes");
const reviewRoutes = require("./routes/review_routes");
const portfolioRoutes = require("./routes/portfolio_routes");
const addroutes = require("./routes/add_routes");
const paymentroutes = require("./routes/payment_routes");
const auth = require("./middlewares/authmiddleware");
const settingsRoutes = require("./routes/settings_routes");

const app = express();

// CORS
app.use(cors());

// Increase body size limit to allow large file handling
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Health check
app.get("/", (req, res) => {
  res.send("Wedding backend is running!");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/ad", addroutes);
app.use("/api/payment", paymentroutes);
app.use("/api/settings", settingsRoutes);

// Connect to MongoDB
dbConnection();

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
