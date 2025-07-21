exports.getProfile = async (req, res) => {
    try {
      const user = req.user;
  
      res.status(200).json({
        success: true,
        data: {
          name: user.firstname + ' ' + user.lastname,
          email: user.email,
          role: user.role,
          paymentStatus: user.paymentStatus,
          phone: user.phone || null
        }
      });
    } catch (error) {
      console.error('[Profile Error]', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
  