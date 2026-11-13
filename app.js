import express from "express";
import productRoutes from "./src/routes/products.js";
import registerCustomerRoutes from "./src/routes/registerCustomer.js";
import cookieParser from "cookie-parser";
import loginCustomerRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import cors from "cors";

//Creo una constante que guarde Express
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    // permitir el envío de cookies y credenciales
    credentials: true,
  }),
);

app.use(cookieParser());

//Que acepte los json desde postman
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/registerCustomer", registerCustomerRoutes);
app.use("/api/loginCustomers", loginCustomerRoutes);
app.use("/api/logout", logoutRoutes);

export default app;
