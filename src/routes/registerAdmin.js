import express from "express";
import registerAdminController from "../controllers/registerAdminController.js";

const router = express.Router();

router.route("/").post(registerAdminController.register);

export default router;
