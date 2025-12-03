import express from "express";
import { checkAuth, loginUser, logoutUser, signupUser } from "../controllers/user.controller.js";
import protectAuth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check-auth', protectAuth, checkAuth);

export default router;