import express from "express";
import loginAdminController from "../controllers/loginAdminController.js";

const router = express.Router();

router.route("/").post(loginAdminController.login);

export default router;
