import { doc, updateDoc, Timestamp, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

const sendCarNotification = async (
    userId: string,
    userName: string,
    carInfo: { make: string; model: string; year: number },
    type: "approved" | "rejected" | "suspended" | "reactivated",
    reason?: string,
) => {
    try {
        let title = "";
        let message = "";

        const carName = `${carInfo.year} ${carInfo.make} ${carInfo.model}`;

        switch (type) {
            case "approved":
                title = "Car Listing Approved!";
                message = `Congratulations ${userName}! Your ${carName} has been approved and is now live. Users can start booking it.`;
                break;
            case "rejected":
                title = "Car Listing Rejected";
                message = `Hi ${userName}, your ${carName} listing was rejected. Reason: ${reason}. Please make corrections and resubmit.`;
                break;
            case "suspended":
                title = "Car Listing Suspended";
                message = `Hi ${userName}, your ${carName} has been temporarily suspended. Reason: ${reason}.`;
                break;
            case "reactivated":
                title = "Car Listing Reactivated";
                message = `Hi ${userName}, your ${carName} has been reactivated and is now available for bookings again.`;
                break;
        }

        const notification = {
            userId,
            recipientRole: "hoster",
            type:
                type === "approved"
                    ? "car_approved"
                    : type === "rejected"
                      ? "car_rejected"
                      : type === "suspended"
                        ? "car_suspended"
                        : "car_reactivated",
            title,
            message,
            relatedType: "car",
            data: {
                carMake: carInfo.make,
                carModel: carInfo.model,
                carYear: carInfo.year,
                ...(reason && { reason }),
            },
            read: false,
            readAt: null,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "notifications"), notification);
        console.log(`✅ Notification sent to user ${userId} for car ${type}`);
    } catch (error) {
        console.error("❌ Error sending car notification:", error);
    }
};

export const carService = {
    approveCar: async (carId: string) => {
        try {
            const carRef = doc(db, "cars", carId);
            const carDoc = await getDoc(carRef);

            if (!carDoc.exists()) {
                throw new Error("Car not found");
            }

            const carData = carDoc.data();

            await updateDoc(carRef, {
                status: "active",
                isActive: true,
                reviewedAt: Timestamp.now(),
                remarks: null,
                updatedAt: Timestamp.now(),
            });

            // Send notification to car owner
            if (carData.ownerId && carData.ownerInfo?.displayName) {
                await sendCarNotification(
                    carData.ownerId,
                    carData.ownerInfo.displayName,
                    {
                        make: carData.make,
                        model: carData.model,
                        year: carData.year,
                    },
                    "approved",
                );
            }

            console.log("✅ Car approved:", carId);
            return {
                success: true,
                message: "Car approved successfully",
            };
        } catch (error) {
            console.error("❌ Error approving car:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error("Failed to approve car: " + errorMessage);
        }
    },

    rejectCar: async (carId: string, remarks: string) => {
        try {
            if (!remarks || remarks.trim() === "") {
                throw new Error("Remarks are required for rejection");
            }

            const carRef = doc(db, "cars", carId);
            const carDoc = await getDoc(carRef);

            if (!carDoc.exists()) {
                throw new Error("Car not found");
            }

            const carData = carDoc.data();

            await updateDoc(carRef, {
                status: "rejected",
                isActive: false,
                remarks: remarks.trim(),
                reviewedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            // Send notification to car owner
            if (carData.ownerId && carData.ownerInfo?.displayName) {
                await sendCarNotification(
                    carData.ownerId,
                    carData.ownerInfo.displayName,
                    {
                        make: carData.make,
                        model: carData.model,
                        year: carData.year,
                    },
                    "rejected",
                    remarks.trim(),
                );
            }

            console.log("✅ Car rejected:", carId);
            return {
                success: true,
                message: "Car rejected successfully",
            };
        } catch (error) {
            console.error("❌ Error rejecting car:", error);
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Failed to reject car");
            }
        }
    },

    suspendCar: async (carId: string, reason: string) => {
        try {
            if (!reason || reason.trim() === "") {
                throw new Error("Reason is required for suspension");
            }

            const carRef = doc(db, "cars", carId);
            const carDoc = await getDoc(carRef);

            if (!carDoc.exists()) {
                throw new Error("Car not found");
            }

            const carData = carDoc.data();

            await updateDoc(carRef, {
                status: "suspended",
                isActive: false,
                remarks: reason.trim(),
                reviewedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            // Send notification to car owner
            if (carData.ownerId && carData.ownerInfo?.displayName) {
                await sendCarNotification(
                    carData.ownerId,
                    carData.ownerInfo.displayName,
                    {
                        make: carData.make,
                        model: carData.model,
                        year: carData.year,
                    },
                    "suspended",
                    reason.trim(),
                );
            }

            console.log("✅ Car suspended:", carId);
            return {
                success: true,
                message: "Car suspended successfully",
            };
        } catch (error) {
            console.error("❌ Error suspending car:", error);
            throw new Error(error instanceof Error ? error.message : "Failed to suspend car");
        }
    },

    reactivateCar: async (carId: string) => {
        try {
            const carRef = doc(db, "cars", carId);
            const carDoc = await getDoc(carRef);

            if (!carDoc.exists()) {
                throw new Error("Car not found");
            }

            const carData = carDoc.data();

            await updateDoc(carRef, {
                status: "active",
                isActive: true,
                remarks: null,
                reviewedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            // Send notification to car owner
            if (carData.ownerId && carData.ownerInfo?.displayName) {
                await sendCarNotification(
                    carData.ownerId,
                    carData.ownerInfo.displayName,
                    {
                        make: carData.make,
                        model: carData.model,
                        year: carData.year,
                    },
                    "reactivated",
                );
            }

            console.log("✅ Car reactivated:", carId);
            return {
                success: true,
                message: "Car reactivated successfully",
            };
        } catch (error) {
            console.error("❌ Error reactivating car:", error);
            throw new Error("Failed to reactivate car: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    },

    deleteCar: async (carId: string) => {
        try {
            const carRef = doc(db, "cars", carId);
            const carDoc = await getDoc(carRef);

            if (!carDoc.exists()) {
                throw new Error("Car not found");
            }

            await updateDoc(carRef, {
                isDeleted: true,
                isActive: false,
                status: "suspended",
                updatedAt: Timestamp.now(),
            });

            console.log("✅ Car deleted (soft):", carId);
            return {
                success: true,
                message: "Car deleted successfully",
            };
        } catch (error) {
            console.error("❌ Error deleting car:", error);
            throw new Error("Failed to delete car: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    },

    restoreCar: async (carId: string) => {
        try {
            const carRef = doc(db, "cars", carId);
            const carDoc = await getDoc(carRef);

            if (!carDoc.exists()) {
                throw new Error("Car not found");
            }

            await updateDoc(carRef, {
                isDeleted: false,
                isActive: true,
                status: "active",
                updatedAt: Timestamp.now(),
            });

            console.log("✅ Car restored:", carId);
            return {
                success: true,
                message: "Car restored successfully",
            };
        } catch (error) {
            console.error("❌ Error restoring car:", error);
            throw new Error("Failed to restore car: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    },
};

export default carService;
