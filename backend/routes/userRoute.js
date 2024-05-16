

const express = require("express");
const { loginUserController, getAllUsersController, userByIdController, signUpUserController, otpVerifyController } = require("../controllers/userController");
const router = express.Router();

router.post("/login", loginUserController);

router.get("/allUsers", getAllUsersController);
router.post("/login/verify", otpVerifyController);
router.get("/details/:id", userByIdController);
router.post("/signup", signUpUserController);


module.exports = router;