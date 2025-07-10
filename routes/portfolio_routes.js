const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio_controller');
const { protect } = require('../middlewares/authmiddleware');
const upload = require('../middlewares/multer');

// Route → create portfolio
router.post(
  '/createportfolio',
  protect,
  upload.array('images', 10),
  portfolioController.createPortfolio
);
router.get(
    '/getportfolios',
    protect,
    portfolioController.getUserPortfolios
  );

router.get(
    '/getallportfolios',
    protect,
    portfolioController.getAllPortfoliosOfLoggedInUser
  );

module.exports = router;

