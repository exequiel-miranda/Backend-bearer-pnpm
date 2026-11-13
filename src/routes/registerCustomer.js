import express from "express";
import registerCustomerController from "../controllers/registerCustomerController.js";

const router = express.Router();

router.route("/").post(registerCustomerController.register);

export default router;
