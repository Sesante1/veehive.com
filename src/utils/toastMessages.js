import toast from "react-hot-toast";
import { firebaseErrorMessages } from "./firebaseErrors";

export const showFirebaseError = (error) => {
  const message =
    firebaseErrorMessages[error.code] || "Something went wrong. Try again.";
  toast.error(message);
};

export const showSuccess = (message) => {
  toast.success(message);
};