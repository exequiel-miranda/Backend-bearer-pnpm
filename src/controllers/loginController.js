const loginController = {};

import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";
import customersModel from "../models/customers.js";

loginController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await customersModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //Si el tercer fallo dejó un timeOut vigente, no se deja entrar
    if (user.timeOut && user.timeOut > Date.now()) {
      return res.status(403).json({
        message: "User blocked, try again later",
        timeOut: user.timeOut,
      });
    }

    //El bloqueo ya venció: los intentos vuelven a empezar
    if (user.timeOut) {
      user.loginAttemps = 0;
      user.timeOut = null;
    }

    const validPassword = await bcryptjs.compare(password, user.password);

    if (!validPassword) {
      user.loginAttemps = (user.loginAttemps || 0) + 1;

      if (user.loginAttemps >= 3) {
        user.timeOut = new Date(Date.now() + 15 * 60 * 1000);
      }

      await user.save();

      if (user.loginAttemps >= 3) {
        return res.status(403).json({
          message: "User blocked, try again later",
          timeOut: user.timeOut,
        });
      }

      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.loginAttemps = 0;
    user.timeOut = null;
    await user.save();

    //El token guarda el id del usuario para la cookie y para Bearer
    const token = jsonwebtoken.sign(
      { id: user._id, userType: user.userType },
      config.JWT.secret,
      { expiresIn: "7d" },
    );

    if ((req.headers["x-client"] || "web").toLowerCase() === "mobile") {
      return res.json({ message: "Login successful", token });
    }

    res.cookie("authCookie", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return res.json({ message: "Login successful", id: user._id });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginController;
