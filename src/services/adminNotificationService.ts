import { db } from "../../FirebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type AdminNotificationType =
    | "verification_approved"
    | "verification_declined"
    | "account_suspended"
    | "account_banned"
    | "account_reactivated"
    | "system_alert";

export interface AdminNotificationData {
    userId: string;
    recipientRole: "guest" | "hoster";
    type: AdminNotificationType;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: "verification" | "account" | "license" | "identity";
    actionUrl?: string;
    data?: Record<string, any>;
    read: boolean;
    readAt?: Date | null;
    createdAt: any;
    expiresAt?: Date | null;
}

const createAdminNotification = async (notificationData: Omit<AdminNotificationData, "read" | "createdAt">): Promise<string> => {
    try {
        const notification: AdminNotificationData = {
            ...notificationData,
            read: false,
            readAt: null,
            createdAt: serverTimestamp(),
        };

        const notificationRef = await addDoc(collection(db, "notifications"), notification);

        console.log("Admin notification created:", notificationRef.id);
        return notificationRef.id;
    } catch (error) {
        console.error("Error creating admin notification:", error);
        throw error;
    }
};

export const notifyGuestVerificationApproved = async (userId: string, userName: string) => {
    return createAdminNotification({
        userId,
        recipientRole: "guest",
        type: "verification_approved",
        title: "Guest Verification Approved!",
        message: `Congratulations ${userName}! Your driver's license has been verified. You can now rent cars.`,
        relatedType: "license",
        // actionUrl: "/profile/verification",
        data: {
            verificationType: "driver_license",
            role: "guest",
        },
    });
};

export const notifyGuestVerificationDeclined = async (userId: string, userName: string, reason: string) => {
    return createAdminNotification({
        userId,
        recipientRole: "guest",
        type: "verification_declined",
        title: "Guest Verification Declined",
        message: `Hi ${userName}, your driver's license verification was declined. Reason: ${reason}. Please resubmit with corrections.`,
        relatedType: "license",
        // actionUrl: "/guestProfile",
        data: {
            verificationType: "driver_license",
            role: "guest",
            declineReason: reason,
        },
    });
};

export const notifyHosterVerificationApproved = async (userId: string, userName: string) => {
    return createAdminNotification({
        userId,
        recipientRole: "hoster",
        type: "verification_approved",
        title: "Hoster Verification Approved!",
        message: `Congratulations ${userName}! Your identity has been verified. You can now list your cars for rent.`,
        relatedType: "identity",
        // actionUrl: "/profile/verification",
        data: {
            verificationType: "identity",
            role: "hoster",
        },
    });
};

export const notifyHosterVerificationDeclined = async (userId: string, userName: string, reason: string) => {
    return createAdminNotification({
        userId,
        recipientRole: "hoster",
        type: "verification_declined",
        title: "Hoster Verification Declined",
        message: `Hi ${userName}, your identity verification was declined. Reason: ${reason}. Please resubmit with corrections.`,
        relatedType: "identity",
        // actionUrl: "/profile/verification",
        data: {
            verificationType: "identity",
            role: "hoster",
            declineReason: reason,
        },
    });
};

export const notifyAccountSuspended = async (userId: string, userName: string, days: number, reason: string, suspendedUntil: string) => {
    // Send to both roles since account is suspended
    const notifications = [];

    notifications.push(
        createAdminNotification({
            userId,
            recipientRole: "guest",
            type: "account_suspended",
            title: "⚠️ Account Suspended",
            message: `Hi ${userName}, your account has been suspended for ${days} days. Reason: ${reason}. Suspension ends: ${suspendedUntil}`,
            relatedType: "account",
            data: {
                suspensionDays: days,
                reason,
                suspendedUntil,
            },
        }),
    );

    notifications.push(
        createAdminNotification({
            userId,
            recipientRole: "hoster",
            type: "account_suspended",
            title: "Account Suspended",
            message: `Hi ${userName}, your account has been suspended for ${days} days. Reason: ${reason}. Suspension ends: ${suspendedUntil}`,
            relatedType: "account",
            data: {
                suspensionDays: days,
                reason,
                suspendedUntil,
            },
        }),
    );

    return Promise.all(notifications);
};

export const notifyAccountBanned = async (userId: string, userName: string) => {
    // Send to both roles since account is banned
    const notifications = [];

    notifications.push(
        createAdminNotification({
            userId,
            recipientRole: "guest",
            type: "account_banned",
            title: "Account Banned",
            message: `Hi ${userName}, your account has been permanently banned due to violations of our terms of service. If you believe this is an error, please contact support.`,
            relatedType: "account",
            data: {
                permanent: true,
            },
        }),
    );

    notifications.push(
        createAdminNotification({
            userId,
            recipientRole: "hoster",
            type: "account_banned",
            title: "Account Banned",
            message: `Hi ${userName}, your account has been permanently banned due to violations of our terms of service. If you believe this is an error, please contact support.`,
            relatedType: "account",
            data: {
                permanent: true,
            },
        }),
    );

    return Promise.all(notifications);
};

export const notifyAccountReactivated = async (userId: string, userName: string) => {
    // Send to both roles
    const notifications = [];

    notifications.push(
        createAdminNotification({
            userId,
            recipientRole: "guest",
            type: "account_reactivated",
            title: "Account Reactivated",
            message: `Welcome back ${userName}! Your account has been reactivated. You can now use all features again.`,
            relatedType: "account",
            // actionUrl: "/home",
            data: {
                reactivated: true,
            },
        }),
    );

    notifications.push(
        createAdminNotification({
            userId,
            recipientRole: "hoster",
            type: "account_reactivated",
            title: "Account Reactivated",
            message: `Welcome back ${userName}! Your account has been reactivated. You can now use all features again.`,
            relatedType: "account",
            // actionUrl: "/home",
            data: {
                reactivated: true,
            },
        }),
    );

    return Promise.all(notifications);
};

export default {
    notifyGuestVerificationApproved,
    notifyGuestVerificationDeclined,
    notifyHosterVerificationApproved,
    notifyHosterVerificationDeclined,
    notifyAccountSuspended,
    notifyAccountBanned,
    notifyAccountReactivated,
};
