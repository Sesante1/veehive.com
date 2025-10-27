import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

interface RoleDistribution {
    name: string;
    value: number;
    percentage: number;
}


export const useRoleDistribution = () => {
    const [roleData, setRoleData] = useState<RoleDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("🔥 Setting up role distribution listener...");

        const unsubscribe = onSnapshot(
            collection(db, "users"),
            (snapshot) => {
                const users = snapshot.docs.map((doc) => doc.data());

                // Count guests (users with license verification)
                const guestCount = users.filter(
                    (user) =>
                        user.licenseVerificationStatus === "verified" ||
                        user.licenseVerificationStatus === "pending" ||
                        user.licenseVerificationStatus === "rejected",
                ).length;

                // Count hosters (users with identity verification)
                const hosterCount = users.filter(
                    (user) =>
                        user.identityVerificationStatus === "verified" ||
                        user.identityVerificationStatus === "pending" ||
                        user.identityVerificationStatus === "rejected",
                ).length;

                // Users who are neither (just registered, no verification attempts)
                const unassignedCount = users.filter((user) => !user.licenseVerificationStatus && !user.identityVerificationStatus).length;

                const total = users.length;

                const data: RoleDistribution[] = [
                    {
                        name: "Guests",
                        value: guestCount,
                        percentage: total > 0 ? Math.round((guestCount / total) * 100) : 0,
                    },
                    {
                        name: "Hosters",
                        value: hosterCount,
                        percentage: total > 0 ? Math.round((hosterCount / total) * 100) : 0,
                    },
                ];

                // Only add "Unassigned" if there are any
                if (unassignedCount > 0) {
                    data.push({
                        name: "Unassigned",
                        value: unassignedCount,
                        percentage: total > 0 ? Math.round((unassignedCount / total) * 100) : 0,
                    });
                }

                setRoleData(data);
                setLoading(false);
            },
            (err) => {
                console.error("❌ Error fetching role distribution:", err);
                setError(err.message);
                setLoading(false);
            },
        );

        return () => {
            console.log("🔌 Cleaning up role distribution listener");
            unsubscribe();
        };
    }, []);

    return {
        roleData,
        loading,
        error,
    };
};

export default useRoleDistribution;
