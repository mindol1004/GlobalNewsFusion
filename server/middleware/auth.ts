import { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken } from "../services/firebase";
import { User } from "@shared/schema";

// Extend the Express Request type to include user
interface AuthRequest extends Request {
  user?: User;
}

/**
 * Authentication middleware to verify Firebase ID token
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await verifyFirebaseToken(req);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
}
