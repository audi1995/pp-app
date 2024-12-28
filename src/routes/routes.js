const express = require('express');
const router = express.Router();
const { verifyWebToken } = require("../helpers/jwt");
const userController = require("../controller/usercontroller");


//User routes
router.post('/users/create', userController.userRegister)
router.post("/users/login",userController.userLogin);
router.put("/users/update",verifyWebToken, userController.updateUser);
router.get("/users/getuser/:id",verifyWebToken, userController.getUserById);
router.delete('/users/delete', verifyWebToken, userController.removeUser);

//Service routes
router.post('/subscription/create',verifyWebToken, userController.createSubscription)
router.get('/subscription/getAll',verifyWebToken, userController.getAllSubscriptions)
router.put('/subscription/update',verifyWebToken, userController.updateSubscription)
router.delete('/subscription/delete', verifyWebToken, userController.deleteSubscription);

//Webhook routes
router.post('/webhook/subscription/create', userController.createSubscriptionByWebhook)//webhook
router.get('/webhook/subscription/byusername',userController.getSubscriptionbyUserName)
router.post('/webhook/user/create',userController.userRegister)

module.exports = router;