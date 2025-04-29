import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert } from "firebase-admin/app";
import { User } from "@shared/schema";
import { storage } from "../storage";

// Initialize Firebase Admin SDK
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin only if all required variables are present
let firebaseAdmin: any = null;

if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
  try {
    firebaseAdmin = initializeApp({
      credential: cert(firebaseConfig as any)
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
} else {
  console.warn("Firebase Admin not initialized - missing environment variables");
}

/**
 * Verify Firebase ID token from Authorization header
 */
export async function verifyFirebaseToken(req: Request): Promise<User | null> {
  try {
    if (!firebaseAdmin) {
      console.warn("Firebase Admin not initialized - authentication skipped");
      return null;
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    
    if (!token) {
      return null;
    }

    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token);
    
    if (!decodedToken.uid) {
      return null;
    }

    // Get the user from the database
    const user = await storage.getUserByFirebaseId(decodedToken.uid);
    
    return user || null;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}
