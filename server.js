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
const paymentroutes = require('./routes/payment_routes');
const app = express();

app.use(cors());

// ✅ JSON limit badhao yahan:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Wedding backend is running!");
});

app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use('/api/ad', addroutes);
app.use('/api/payment', paymentroutes);

dbConnection();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
