// hooks/useUsers.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

// Reusable type for uploaded files
export interface UploadedFile {
  filename: string;
  path: string;
  uploadedAt: string;
  url: string;
}

export interface DriversLicense {
  frontLicense?: UploadedFile;
  backLicense?: UploadedFile;
  selfieWithLicense?: UploadedFile;
}

export interface IdentityVerification {
  frontId?: UploadedFile;
  backId?: UploadedFile;
  selfieWithId?: UploadedFile;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phoneVerified: boolean;
  address: string;
  birthDate: string;
  profileImage: string;
  latitude: number;
  longitude: number;
  role: Record<string, boolean>; 
  driversLicense?: DriversLicense;
  identityVerification?: IdentityVerification;
  createdAt?: any; 
  updatedAt?: any; 
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersData: User[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          // explicitly remove birthDate if you don’t want it
          const { birthDate, ...rest } = data;

          return {
            id: doc.id,
            birthDate: birthDate || "",
            ...rest,
          } as User;
        });

        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { users, loading };
}
