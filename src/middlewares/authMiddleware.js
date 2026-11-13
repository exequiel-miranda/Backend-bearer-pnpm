//Este Middleware lo que hará será:
//#1- Accede a las cookies o al token Bearer
//#2- Mira que valor hay dentro
//#3- Si el tipo de usuario coincide con la protección que
//escribimos en el endpoint o método HTTP entonces lo deja pasar
//Si no, no

import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

export const validateAuthCookie = (allowedTypes = []) => {
  return (req, res, next) => {
    try {
      //En movil el token viaja por Authorization: Bearer <token>
      //En web el mismo token viaja en la cookie authCookie
      const authHeader = req.headers.authorization || "";
      let token = null;

      if (authHeader.toLowerCase().startsWith("bearer ")) {
        token = authHeader.slice(7).trim();
      } else {
        //#1- Extraer el token que está en la cookie (authCookie)
        //ya que en esa cookie está el id y el tipo de usuario guardados
        token = req.cookies.authCookie;
      }

      if (!token) {
        return res
          .status(403)
          .json({ message: "No cookie found, Authorization require" });
      }

      //#2- Extraer toda la información del token
      const decoded = jsonwebtoken.verify(token, config.JWT.secret);

      //Verificar si el rol que tiene el token puede pasar o no
      if (!allowedTypes.includes(decoded.userType)) {
        return res.status(401).json({ message: "Access denied" });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.log("error" + error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
