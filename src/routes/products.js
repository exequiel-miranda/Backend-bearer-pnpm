import express from "express";
import productsController from "../controllers/productsController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

//Router() nos ayuda a colocar los métodos
// que tendrá el endpoint
const router = express.Router();

router
  .route("/")
  .get(validateAuthCookie(["Customer", "Admin"]), productsController.getProducts)
  .post(validateAuthCookie(["Admin"]), productsController.insertProducts);

router.route("/lowStock").get(productsController.getLowStock);

router.route("/priceRange").post(productsController.getProductsByPriceRange);

router.route("/count").get(productsController.countProducts);

router.route("/searchName").post(productsController.searchByName);

router
  .route("/:id")
  .put(productsController.updateProducts)
  .delete(productsController.deleteProducts)
  .get(productsController.getProductById);

export default router;
