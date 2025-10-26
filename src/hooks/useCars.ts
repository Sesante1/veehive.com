// hooks/useCars.ts - Optimized Car Management Hook
import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

export interface Car {
    id: string;
    carId?: string;
    carType?: string;
    make?: string;
    model?: string;
    year?: number;
    dailyRate?: number;
    description?: string;
    fuel?: string;
    transmission?: string;
    seats?: number;
    status?: "pending" | "active" | "rejected" | "suspended";
    isActive?: boolean;
    isDeleted?: boolean;
    totalTrips?: number;
    ownerId?: string;
    ownerInfo?: {
        displayName?: string;
        email?: string;
        photoURL?: string;
        uid?: string;
    };
    location?: {
        address?: string;
        coordinates?: {
            latitude?: number;
            longitude?: number;
        };
    };
    images?: Array<{
        url: string;
        filename: string;
        uploadedAt: string;
    }>;
    documents?: {
        certificateOfRegistration?: {
            url: string;
            filename: string;
            uploadedAt: string;
        };
        officialReceipt?: {
            url: string;
            filename: string;
            uploadedAt: string;
        };
    };
    remarks?: string | null;
    reviewedAt?: any;
    reviewedBy?: string | null;
    createdAt?: any;
    updatedAt?: any;
    lastBookedAt?: any;
    tripDate?: any;
}

/**
 * Optimized hook to fetch cars with real-time updates
 * Uses onSnapshot for instant updates and memoization for performance
 */
export const useCars = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("🚗 Setting up real-time cars listener...");

        try {
            // Create query with ordering
            const carsQuery = query(collection(db, "cars"), orderBy("createdAt", "desc"));

            // Set up real-time listener
            const unsubscribe = onSnapshot(
                carsQuery,
                (snapshot) => {
                    console.log(`✅ Received ${snapshot.size} cars from Firestore`);

                    const carsData: Car[] = [];

                    snapshot.forEach((doc) => {
                        carsData.push({
                            id: doc.id,
                            ...doc.data(),
                        } as Car);
                    });

                    setCars(carsData);
                    setLoading(false);
                    setError(null);
                },
                (err) => {
                    console.error("❌ Error fetching cars:", err);
                    setError(err.message);
                    setLoading(false);
                },
            );

            // Cleanup listener on unmount
            return () => {
                console.log("🔌 Cleaning up cars listener");
                unsubscribe();
            };
        } catch (err: any) {
            console.error("❌ Error setting up cars listener:", err);
            setError(err.message);
            setLoading(false);
        }
    }, []);

    // Memoize statistics for performance
    const stats = useMemo(() => {
        const total = cars.length;
        const pending = cars.filter((c) => c.status === "pending").length;
        const active = cars.filter((c) => c.status === "active").length;
        const rejected = cars.filter((c) => c.status === "rejected").length;
        const suspended = cars.filter((c) => c.status === "suspended").length;
        const activeAndAvailable = cars.filter((c) => c.status === "active" && c.isActive === true && c.isDeleted === false).length;
        const deleted = cars.filter((c) => c.isDeleted === true).length;
        const totalRevenue = cars.reduce((sum, car) => {
            return sum + (car.totalTrips || 0) * (car.dailyRate || 0);
        }, 0);

        return {
            total,
            pending,
            active,
            rejected,
            suspended,
            activeAndAvailable,
            deleted,
            totalRevenue,
        };
    }, [cars]);

    return {
        cars,
        loading,
        error,
        stats,
    };
};

/**
 * Hook to get a single car by ID with real-time updates
 */
export const useCar = (carId: string | null) => {
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!carId) {
            setCar(null);
            setLoading(false);
            return;
        }

        console.log(`🚗 Setting up real-time listener for car: ${carId}`);

        try {
            const carRef = doc(db, "cars", carId);

            const unsubscribe = onSnapshot(
                carRef,
                (doc) => {
                    if (doc.exists()) {
                        setCar({
                            id: doc.id,
                            ...doc.data(),
                        } as Car);
                    } else {
                        setCar(null);
                        setError("Car not found");
                    }
                    setLoading(false);
                },
                (err) => {
                    console.error("❌ Error fetching car:", err);
                    setError(err.message);
                    setLoading(false);
                },
            );

            return () => {
                console.log(`🔌 Cleaning up listener for car: ${carId}`);
                unsubscribe();
            };
        } catch (err: any) {
            console.error("❌ Error setting up car listener:", err);
            setError(err.message);
            setLoading(false);
        }
    }, [carId]);

    return { car, loading, error };
};

export default useCars;
