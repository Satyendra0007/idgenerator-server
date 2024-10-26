const express = require("express")
const authController = require("../controllers/auth-controller")
const userMiddleware = require("../middlewares/user-middleware")
const multer = require("multer")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router()

router.route("/login").post(authController.logIn)
router.route("/signup").post(upload.single('image'), authController.signUp)
router.route("/user").get(userMiddleware, authController.getUserData)

module.exports = router