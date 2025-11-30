import express from "express";
import { checkAuth, loginUser, logoutUser, signupUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check-auth', checkAuth);

export default router;