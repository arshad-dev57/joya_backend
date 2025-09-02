const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio_controller');
const { protect } = require('../middlewares/authmiddleware');
const upload = require('../middlewares/multer');
const { protect2 } = require('../middlewares/oldauthmiddleware');
// Route → create portfolio
router.post(
  '/createportfolio',
  protect2,
  upload.array('images', 10),
  portfolioController.createPortfolio
);
router.get(
    '/getportfolios',
    protect2,
    portfolioController.getUserPortfolios
  );

router.get(
    '/getallportfolios',
    protect2,
    portfolioController.getAllPortfoliosOfLoggedInUser
  );

module.exports = router;

