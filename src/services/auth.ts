
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "../../FirebaseConfig";

/**
 * Logs in a user with Firebase Auth
 * @param email - user email
 * @param password - user password
 */
export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
}