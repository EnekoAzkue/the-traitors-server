import jwt, { SignOptions, Secret, TokenExpiredError } from "jsonwebtoken";

const SECRET_KEY: Secret = process.env.JWT_SECRET || "default_secret_key";

export interface JwtPayload {
  id: string;
  email: string;
}

const parseExpiresIn = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 3600;
  const value = parseInt(match[1]!);
  const unit = match[2];
  switch (unit) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 3600 * 24;
    default: return 3600;
  }
};

// Genera un token
export const generateToken = (payload: JwtPayload, expiresIn: string = "1h"): string => {
  const options: SignOptions = { expiresIn: parseExpiresIn(expiresIn) };
  return jwt.sign(payload, SECRET_KEY, options);
};

// Verifica el token y detecta expiración
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, SECRET_KEY) as JwtPayload;
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      throw new Error("Token caducado");
    }
    throw new Error("Token inválido");
  }
};

// Renovar token
export const renewTokenIfExpired = (token: string, expiresIn: string = "1h"): string => {
  try {
    // Intenta verificar normalmente
    verifyToken(token);
    // Si no lanza error → token válido, no hace falta renovar
    return token;
  } catch (error: any) {
    if (error.message === "Token caducado") {
      // Decodifica payload sin verificar expiración
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded) throw new Error("No se pudo decodificar token expirado");
      // Genera un nuevo token
      return generateToken({ id: decoded.id, email: decoded.email }, expiresIn);
    }
    throw error; // token inválido real
  }
};
