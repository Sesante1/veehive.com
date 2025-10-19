import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

export function useUserGrowth() {
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGrowth = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));

        // initialize counts
        const counts: Record<string, number> = {
          Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
          Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
        };

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt?.toDate) {
            const month = dayjs(data.createdAt.toDate()).format("MMM");
            counts[month] = (counts[month] || 0) + 1;
          }
        });

        // convert to chart format
        const chartData = Object.keys(counts).map((month) => ({
          month,
          users: counts[month],
        }));

        setUserGrowthData(chartData);
      } catch (err) {
        console.error("Error fetching user growth:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGrowth();
  }, []);

  return { userGrowthData, loading };
}
