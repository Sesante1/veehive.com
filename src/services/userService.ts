import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import {
    notifyGuestVerificationApproved,
    notifyGuestVerificationDeclined,
    notifyHosterVerificationApproved,
    notifyHosterVerificationDeclined,
    notifyAccountSuspended,
    notifyAccountBanned,
    notifyAccountReactivated,
} from "./adminNotificationService";

export const userService = {

    approveLicenseVerification: async (userId: string) => {
        try {
            // Get user data first for notification
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const userName = userData?.firstName || "User";

            // Update ONLY license verification - don't touch identity
            await updateDoc(userRef, {
                "driversLicense.verificationStatus": "approved",
                "driversLicense.reviewedAt": new Date().toISOString(),
                "driversLicense.adminNote": null,
                "role.Guest": true, // Set Guest role when license approved
                updatedAt: Timestamp.now(),
            });

            await notifyGuestVerificationApproved(userId, userName);

            return {
                success: true,
                message: "License verification approved - Guest role granted",
            };
        } catch (error) {
            console.error("❌ Error approving license:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error("Failed to approve license: " + errorMessage);
        }
    },

    rejectLicenseVerification: async (userId: string, remarks: string) => {
        try {
            if (!remarks || remarks.trim() === "") {
                throw new Error("Remarks are required for rejection");
            }

            // Get user data first for notification
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const userName = userData?.firstName || "User";

            // Update ONLY license verification - DON'T TOUCH IDENTITY
            await updateDoc(userRef, {
                "driversLicense.verificationStatus": "declined",
                "driversLicense.adminNote": remarks.trim(),
                "driversLicense.reviewedAt": new Date().toISOString(),
                "role.Guest": false, // Remove ONLY Guest role
                updatedAt: Timestamp.now(),
            });

            await notifyGuestVerificationDeclined(userId, userName, remarks.trim());

            return {
                success: true,
                message: "License verification rejected - Guest role revoked",
            };
        } catch (error) {
            console.error("❌ Error rejecting license:", error);
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Failed to reject license verification");
            }
        }
    },

    approveIdentityVerification: async (userId: string) => {
        try {
            // Get user data first for notification
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const userName = userData?.firstName || "User";

            // Update ONLY identity verification - don't touch license
            await updateDoc(userRef, {
                "identityVerification.verificationStatus": "approved",
                "identityVerification.reviewedAt": new Date().toISOString(),
                "identityVerification.adminNote": null,
                "role.Hoster": true, // Set Hoster role when identity approved
                updatedAt: Timestamp.now(),
            });

            await notifyHosterVerificationApproved(userId, userName);

            return {
                success: true,
                message: "Identity verification approved - Hoster role granted",
            };
        } catch (error) {
            console.error("❌ Error approving identity:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error("Failed to approve identity: " + errorMessage);
        }
    },

    rejectIdentityVerification: async (userId: string, remarks: string) => {
        try {
            if (!remarks || remarks.trim() === "") {
                throw new Error("Remarks are required for rejection");
            }

            // Get user data first for notification
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const userName = userData?.firstName || "User";

            // Update ONLY identity verification - DON'T TOUCH LICENSE
            await updateDoc(userRef, {
                "identityVerification.verificationStatus": "declined",
                "identityVerification.adminNote": remarks.trim(),
                "identityVerification.reviewedAt": new Date().toISOString(),
                // "role.Hoster": false,
                updatedAt: Timestamp.now(),
            });

            await notifyHosterVerificationDeclined(userId, userName, remarks.trim());

            console.log("✅ Identity rejected - Hoster role revoked (Guest role unchanged):", userId);
            return {
                success: true,
                message: "Identity verification rejected - Hoster role revoked",
            };
        } catch (error) {
            console.error("❌ Error rejecting identity:", error);
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Failed to reject identity verification");
            }
        }
    },

    banUser: async (userId: string) => {
        try {
            // Get user data first for notification
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const userName = userData?.firstName || "User";

            // Update user status - ban removes BOTH roles
            await updateDoc(userRef, {
                status: "banned",
                bannedAt: Timestamp.now(),
                "role.Guest": false,
                "role.Hoster": false,
                updatedAt: Timestamp.now(),
            });

            // Send notification
            await notifyAccountBanned(userId, userName);

            console.log("✅ User banned successfully:", userId);
            return {
                success: true,
                message: "User banned successfully",
            };
        } catch (error) {
            console.error("❌ Error banning user:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error("Failed to ban user: " + errorMessage);
        }
    },

    suspendUser: async (userId: string, days: number, reason: string) => {
        try {
            // if (!days || days <= 0) {
            //     throw new Error("Days must be a positive number");
            // }
            if (!reason || reason.trim() === "") {
                throw new Error("Reason is required for suspension");
            }

            // Get user data first for notification
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const userName = userData?.firstName || "User";

            // Calculate suspension end date
            const suspendedUntil = new Date();
            suspendedUntil.setDate(suspendedUntil.getDate() + days);
            const suspendedUntilStr = suspendedUntil.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            // Update user status - suspension doesn't remove roles
            await updateDoc(userRef, {
                status: "suspended",
                suspendedAt: Timestamp.now(),
                // suspendedUntil: Timestamp.fromDate(suspendedUntil),
                suspensionReason: reason.trim(),
                // suspensionDays: days,
                updatedAt: Timestamp.now(),
            });

            // Send notification with suspension details
            await notifyAccountSuspended(userId, userName, days, reason.trim(), suspendedUntilStr);

            console.log("✅ User suspended successfully:", userId, "for", days, "days");
            return {
                success: true,
                message: `User suspended for ${days} days`,
            };
        } catch (error) {
            console.error("❌ Error suspending user:", error);
            throw new Error(error instanceof Error ? error.message : "Failed to suspend user");
        }
    },

    reactivateUser: async (userId: string) => {
        try {
            // Get user data first for notification
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            const userName = userData?.firstName || "User";

            // Update user status - reactivation doesn't restore roles
            // Admin must manually re-approve verifications if needed
            await updateDoc(userRef, {
                status: "active",
                suspendedAt: null,
                suspendedUntil: null,
                suspensionReason: null,
                suspensionDays: null,
                bannedAt: null,
                reactivatedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            // Send welcome back notification
            await notifyAccountReactivated(userId, userName);

            console.log("✅ User reactivated successfully:", userId);
            return {
                success: true,
                message: "User reactivated successfully",
            };
        } catch (error) {
            console.error("❌ Error reactivating user:", error);
            throw new Error("Failed to reactivate user: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    },
};

export default userService;
