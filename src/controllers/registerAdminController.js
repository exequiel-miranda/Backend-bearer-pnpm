const registerAdminController = {};

import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";
import adminsModel from "../models/admins.js";
import customersModel from "../models/customers.js";

//INSERT de un administrador y apertura de sesion
registerAdminController.register = async (req, res) => {
  //#1- Solicito los datos a guardar
  const { name, lastName, birthdate, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const customerExists = await customersModel.findOne({ email });
    const adminExists = await adminsModel.findOne({ email });

    if (customerExists || adminExists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    //#2- Encripto la contraseña y lleno el Schema
    const passwordHash = await bcryptjs.hash(password, 10);
    const newAdmin = new adminsModel({
      name,
      lastName,
      birthdate,
      email,
      password: passwordHash,
      isVerified: false,
      loginAttemps: 0,
      timeOut: null,
      userType: "Admin",
    });

    //#3- guardo en la base de datos
    await newAdmin.save();

    //El token lleva el id del administrador y su tipo
    const token = jsonwebtoken.sign(
      { id: newAdmin._id, userType: "Admin" },
      config.JWT.secret,
      { expiresIn: "7d" },
    );

    //Web: el id viaja dentro de la cookie authCookie
    //Movil: se envia la cabecera X-Client: mobile y se responde el Bearer
    if ((req.headers["x-client"] || "web").toLowerCase() === "mobile") {
      return res.status(201).json({ message: "Admin saved", token });
    }

    res.cookie("authCookie", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return res.status(201).json({ message: "Admin saved", id: newAdmin._id });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerAdminController;
