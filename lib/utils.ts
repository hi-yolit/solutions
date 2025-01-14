import { PlanDescription } from "@/utils/paystack"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto";


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const IV_LENGTH = 16

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parsePlanDescription = (description: string | null): PlanDescription | null => {
  if (!description) return null
  try {
    // First, try to parse as a JavaScript object literal
    let parsed: any = description

    // If it looks like a JSON string, parse it
    if (typeof description === 'string') {
      // Replace single quotes with double quotes for JSON parsing
      const jsonString = description.replace(/'/g, '"')

      try {
        // Try standard JSON parse
        parsed = JSON.parse(jsonString)
      } catch {
        // If standard parse fails, try eval (with caution)
        try {
          parsed = eval(`(${description})`)
        } catch {
          console.error('Failed to parse description:', description)
          return null
        }
      }
    }

    // Ensure it's an object
    return typeof parsed === 'object' ? parsed : null
  } catch (error) {
    console.error('Failed to parse plan description:', description, error)
    return null
  }
}

export function encryptString(text: string): string {

  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY!, "hex"),
    iv
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptString(encryptedText: string): string {

  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set');
  }

  const [ivHex, encryptedHex] = encryptedText.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const encryptedData = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY!, "hex"),
    iv
  );

  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
