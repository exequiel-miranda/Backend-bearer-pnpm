const registerCustomerController = {};

import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";
import customersModel from "../models/customers.js";

//INSERT de un cliente y apertura de sesion
registerCustomerController.register = async (req, res) => {
  //#1- Solicito los datos a guardar
  const { name, lastName, birthdate, email, password, userType } = req.body;

  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const exists = await customersModel.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    //#2- Encripto la contraseña y lleno el Schema
    const passwordHash = await bcryptjs.hash(password, 10);
    const newCustomer = new customersModel({
      name,
      lastName,
      birthdate,
      email,
      password: passwordHash,
      isVerified: false,
      loginAttemps: 0,
      timeOut: null,
      userType: userType === "Admin" ? "Admin" : "Customer",
    });

    //#3- guardo en la base de datos
    await newCustomer.save();

    //El token lleva el id del usuario y su tipo
    const token = jsonwebtoken.sign(
      { id: newCustomer._id, userType: newCustomer.userType },
      config.JWT.secret,
      { expiresIn: "7d" },
    );

    //Web: el id viaja dentro de la cookie authCookie
    //Movil: se envia la cabecera X-Client: mobile y se responde el Bearer
    if ((req.headers["x-client"] || "web").toLowerCase() === "mobile") {
      return res.status(201).json({ message: "Customer saved", token });
    }

    res.cookie("authCookie", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return res.status(201).json({ message: "Customer saved", id: newCustomer._id });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerCustomerController;
