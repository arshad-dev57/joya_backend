const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const loginController = require('../controllers/login_controller');
const profilecontroller = require('../controllers/profile_controller');
const { protect } = require('../middlewares/authmiddleware');
const upload = require('../middlewares/multer');

// POST /api/users/signup
router.post('/signup', userController.signup);
router.post('/login', loginController.login);
router.get('/profile', protect, profilecontroller.getProfile);
router.post('/logout', protect, userController.logout);
router.get('/getallusers', userController.getAllUsers);
router.delete('/deleteuser/:id', protect, userController.deleteUser);
router.put('/updatepaymentstatus', protect, userController.updatePaymentStatus);
router.put('/updateuserimage/:id', protect, upload.single('image'), userController.updateUserImage);
module.exports = router;
