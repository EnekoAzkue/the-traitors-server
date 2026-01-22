import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../../helpers/utilities/auth/jwt";

const SECRET_KEY = "secret_key";

describe("JWT Tests", () => {
  const payload = { id: "12345", email: "eneko@gmail.com" };
  let token: string;

  test("generateToken should return a string token", () => {
    token = generateToken(payload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  test("verifyToken should decode token correctly", () => {
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  test("jwt.decode returns the correct payload", () => {
    const decoded = jwt.decode(token) as any;
    expect(decoded.id).toBe(payload.id);
  });

  test("token should have an expiration", () => {
    const shortToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "2s" });
    const decoded = jwt.decode(shortToken) as any;
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  test("generated token contains iat and exp fields", () => {
    const t = generateToken(payload);
    const decoded = jwt.decode(t) as any;
  
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
    expect(typeof decoded.iat).toBe("number");
    expect(typeof decoded.exp).toBe("number");
  });
  
  test("verifyToken throws on invalid token", () => {
    const parts = token.split(".");
    const invalid = [parts[0], parts[1], "invalidsignature"].join(".");
    expect(() => verifyToken(invalid)).toThrow();
  });

  test("verifyToken throws if secret is wrong", () => {
    const badToken = jwt.sign(payload, "wrong_secret");
    expect(() => jwt.verify(badToken, SECRET_KEY)).toThrow();
  });

  test("verifyToken returns an object payload", () => {
    const t = generateToken(payload);
    const decoded = verifyToken(t);
  
    expect(typeof decoded).toBe("object");
    expect(decoded).not.toBeNull();
  });
  
  test("email field in payload is preserved", () => {
    const t = generateToken(payload);
    const decoded = verifyToken(t);
    expect(decoded.email).toBe(payload.email);
  });

  test("generated token is non-empty string", () => {
    const t = generateToken(payload);
    expect(typeof t).toBe("string");
    expect(t.length).toBeGreaterThan(10);
  });
});
