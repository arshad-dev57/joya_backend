const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnection = require("./config/db");

// Import Routes
const userRoutes = require("./routes/user_routes");
const serviceRoutes = require("./routes/serviceRoutes");
const vendorRoutes = require("./routes/vendor_routes");
const reviewRoutes = require("./routes/review_routes");
const portfolioRoutes = require("./routes/portfolio_routes");
const addroutes = require('./routes/add_routes');

const app = express();

app.use(cors());

// ✅ JSON limit badhao yahan:
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get("/", (req, res) => {
  res.send("Wedding backend is running!");
});

app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use('/api/ad', addroutes);

dbConnection();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
