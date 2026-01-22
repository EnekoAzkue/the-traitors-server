import { Request, Response, NextFunction } from "express";
import { verifyToken, renewTokenIfExpired, JwtPayload } from "../helpers/utilities/auth/jwt";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader;

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.message === "Token caducado") {
      try {
        const newToken = renewTokenIfExpired(token, "1h"); 
        const decoded = verifyToken(newToken);
        req.user = decoded;

        res.setHeader("x-renewed-token", newToken);

        next();
      } catch (renewError: any) {
        return res.status(401).json({ message: renewError.message });
      }
    } else {
      return res.status(401).json({ message: error.message });
    }
  }
};
