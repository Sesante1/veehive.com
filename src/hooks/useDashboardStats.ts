// hooks/useDashboardStats.ts - Real-time Dashboard Statistics
import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

interface DashboardStats {
    // Users
    totalUsers: number;
    pendingUsers: number;
    verifiedUsers: number;
    suspendedUsers: number;

    // Cars
    totalCars: number;
    pendingCars: number;
    verifiedCars: number;
    suspendedCars: number;

    // Growth percentages (calculated from previous period)
    userGrowth: number;
    carGrowth: number;
}

/**
 * Real-time dashboard statistics hook
 * Fetches all stats from Firebase with onSnapshot
 */
export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        pendingUsers: 0,
        verifiedUsers: 0,
        suspendedUsers: 0,
        totalCars: 0,
        pendingCars: 0,
        verifiedCars: 0,
        suspendedCars: 0,
        userGrowth: 0,
        carGrowth: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("🔥 Setting up dashboard stats listeners...");

        // Users listener
        const usersUnsubscribe = onSnapshot(
            collection(db, "users"),
            (snapshot) => {
                const users = snapshot.docs.map((doc) => doc.data());

                const totalUsers = users.length;

                // Pending: Users with pending license OR identity verification
                const pendingUsers = users.filter(
                    (user) => user.licenseVerificationStatus === "pending" || user.identityVerificationStatus === "pending",
                ).length;

                // Verified: Users with at least one verified role
                const verifiedUsers = users.filter(
                    (user) => user.licenseVerificationStatus === "verified" || user.identityVerificationStatus === "verified",
                ).length;

                // Suspended: Users with suspended or banned status
                const suspendedUsers = users.filter((user) => user.accountStatus === "suspended" || user.accountStatus === "banned").length;

                setStats((prev) => ({
                    ...prev,
                    totalUsers,
                    pendingUsers,
                    verifiedUsers,
                    suspendedUsers,
                }));
            },
            (err) => {
                console.error("❌ Error fetching users:", err);
                setError(err.message);
            },
        );

        // Cars listener
        const carsUnsubscribe = onSnapshot(
            collection(db, "cars"),
            (snapshot) => {
                const cars = snapshot.docs.map((doc) => doc.data());

                // Exclude soft-deleted cars from total
                const activeCarsData = cars.filter((car) => !car.isDeleted);

                const totalCars = activeCarsData.length;
                const pendingCars = activeCarsData.filter((car) => car.status === "pending").length;
                const verifiedCars = activeCarsData.filter((car) => car.status === "active").length;
                const suspendedCars = activeCarsData.filter((car) => car.status === "suspended").length;

                setStats((prev) => ({
                    ...prev,
                    totalCars,
                    pendingCars,
                    verifiedCars,
                    suspendedCars,
                }));

                setLoading(false);
            },
            (err) => {
                console.error("❌ Error fetching cars:", err);
                setError(err.message);
                setLoading(false);
            },
        );

        // Cleanup
        return () => {
            console.log("🔌 Cleaning up dashboard listeners");
            usersUnsubscribe();
            carsUnsubscribe();
        };
    }, []);

    // Calculate growth percentages (simplified - you can enhance this)
    const statsWithGrowth = useMemo(() => {
        // For now, return static growth or calculate based on your needs
        return {
            ...stats,
            userGrowth: 25, // You can calculate this based on historical data
            carGrowth: 12, // You can calculate this based on historical data
        };
    }, [stats]);

    return {
        stats: statsWithGrowth,
        loading,
        error,
    };
};

export default useDashboardStats;
