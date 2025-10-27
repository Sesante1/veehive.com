// DashboardPage.tsx - Updated with Real Data and Clickable Cards
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { useUserGrowth } from "../../hooks/useUserGrowth";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { recentSignupsData } from "@/constants";
import { Footer } from "@/layouts/footer";
import { List, Car, TrendingUp, Users, Clock, CheckCircle, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
    const { theme } = useTheme();
    const { userGrowthData, loading: growthLoading } = useUserGrowth();
    const { stats, loading: statsLoading } = useDashboardStats();
    const navigate = useNavigate();

    const navigateToUsers = (filter) => {
        // Navigate with state to auto-apply filter
        navigate("/dashboard/users", { state: { autoFilter: filter } });
    };

    const navigateToCars = (filter) => {
        // Navigate with state to auto-apply filter
        navigate("/dashboard/cars", { state: { autoFilter: filter } });
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Total Users Card */}
                <div
                    className="card cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => navigateToUsers("all")}
                >
                    <div className="card-header">
                        <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                            <Users size={26} />
                        </div>
                        <p className="card-title">Total Users</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {statsLoading ? "..." : stats.totalUsers.toLocaleString()}
                        </p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                            <TrendingUp size={18} />
                            {stats.userGrowth}%
                        </span>
                    </div>
                </div>

                {/* Total Cars Card */}
                <div
                    className="card cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => navigateToCars("all")}
                >
                    <div className="card-header">
                        <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                            <Car size={26} />
                        </div>
                        <p className="card-title">Total Car listed</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {statsLoading ? "..." : stats.totalCars.toLocaleString()}
                        </p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                            <TrendingUp size={18} />
                            {stats.carGrowth}%
                        </span>
                    </div>
                </div>

                {/* Pending User Approvals Card */}
                <div
                    className="card cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => navigateToUsers("pending")}
                >
                    <div className="card-header">
                        <div className="rounded-lg bg-yellow-500/20 p-2 text-yellow-600 transition-colors dark:bg-yellow-600/20 dark:text-yellow-500">
                            <Clock size={26} />
                        </div>
                        <p className="card-title">Pending User Approvals</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {statsLoading ? "..." : stats.pendingUsers.toLocaleString()}
                        </p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-yellow-600 px-2 py-1 font-medium text-yellow-600 dark:border-yellow-500 dark:text-yellow-500">
                            <Clock size={18} />
                            Awaiting Review
                        </span>
                    </div>
                </div>

                {/* Pending Car Approvals Card */}
                <div
                    className="card cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => navigateToCars("pending")}
                >
                    <div className="card-header">
                        <div className="rounded-lg bg-yellow-500/20 p-2 text-yellow-600 transition-colors dark:bg-yellow-600/20 dark:text-yellow-500">
                            <Clock size={26} />
                        </div>
                        <p className="card-title">Pending Car Approvals</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {statsLoading ? "..." : stats.pendingCars.toLocaleString()}
                        </p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-yellow-600 px-2 py-1 font-medium text-yellow-600 dark:border-yellow-500 dark:text-yellow-500">
                            <Clock size={18} />
                            Awaiting Review
                        </span>
                    </div>
                </div>

                {/* Verified Users Card */}
                <div
                    className="card cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => navigateToUsers("verified")}
                >
                    <div className="card-header">
                        <div className="rounded-lg bg-green-500/20 p-2 text-green-600 transition-colors dark:bg-green-600/20 dark:text-green-500">
                            <CheckCircle size={26} />
                        </div>
                        <p className="card-title">Verified Users</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {statsLoading ? "..." : stats.verifiedUsers.toLocaleString()}
                        </p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-green-600 px-2 py-1 font-medium text-green-600 dark:border-green-500 dark:text-green-500">
                            <CheckCircle size={18} />
                            Approved
                        </span>
                    </div>
                </div>

                {/* Verified Cars Card */}
                <div
                    className="card cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => navigateToCars("active")}
                >
                    <div className="card-header">
                        <div className="rounded-lg bg-green-500/20 p-2 text-green-600 transition-colors dark:bg-green-600/20 dark:text-green-500">
                            <CheckCircle size={26} />
                        </div>
                        <p className="card-title">Verified Cars</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {statsLoading ? "..." : stats.verifiedCars.toLocaleString()}
                        </p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-green-600 px-2 py-1 font-medium text-green-600 dark:border-green-500 dark:text-green-500">
                            <CheckCircle size={18} />
                            Active
                        </span>
                    </div>
                </div>

                {/* Suspended Users Card */}
                <div
                    className="card cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => navigateToUsers("suspended")}
                >
                    <div className="card-header">
                        <div className="rounded-lg bg-red-500/20 p-2 text-red-600 transition-colors dark:bg-red-600/20 dark:text-red-500">
                            <Ban size={26} />
                        </div>
                        <p className="card-title">Suspended Users</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {statsLoading ? "..." : stats.suspendedUsers.toLocaleString()}
                        </p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-red-600 px-2 py-1 font-medium text-red-600 dark:border-red-500 dark:text-red-500">
                            <Ban size={18} />
                            Blocked
                        </span>
                    </div>
                </div>

                {/* Suspended Cars Card */}
                <div
                    className="card cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => navigateToCars("suspended")}
                >
                    <div className="card-header">
                        <div className="rounded-lg bg-red-500/20 p-2 text-red-600 transition-colors dark:bg-red-600/20 dark:text-red-500">
                            <Ban size={26} />
                        </div>
                        <p className="card-title">Suspended Cars</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                            {statsLoading ? "..." : stats.suspendedCars.toLocaleString()}
                        </p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-red-600 px-2 py-1 font-medium text-red-600 dark:border-red-500 dark:text-red-500">
                            <Ban size={18} />
                            Inactive
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* User Growth Chart */}
                <div className="card col-span-1 md:col-span-2 lg:col-span-4">
                    <div className="card-header">
                        <p className="card-title">User Growth</p>
                    </div>
                    <div className="card-body p-0">
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <AreaChart
                                data={userGrowthData}
                                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorUsers"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#10b981"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#10b981"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <Tooltip
                                    cursor={false}
                                    formatter={(value) => `${value} users`}
                                />

                                <XAxis
                                    dataKey="month"
                                    strokeWidth={0}
                                    stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    tickMargin={6}
                                />
                                <YAxis
                                    dataKey="users"
                                    strokeWidth={0}
                                    stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    tickFormatter={(value) => `${value}`}
                                    tickMargin={6}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent User Signups */}
                <div className="card col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="card-header">
                        <p className="card-title">Recent User Signups</p>
                    </div>
                    <div className="card-body h-[300px] overflow-auto p-0">
                        {recentSignupsData.map((sale) => (
                            <div
                                key={sale.id}
                                className="flex items-center justify-between gap-x-4 py-2 pr-2"
                            >
                                <div className="flex items-center gap-x-4">
                                    <img
                                        src={sale.image}
                                        alt={sale.name}
                                        className="size-10 flex-shrink-0 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col gap-y-2">
                                        <p className="font-medium text-slate-900 dark:text-slate-50">{sale.name}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{sale.email}</p>
                                    </div>
                                </div>
                                <p className="font-medium text-slate-900 dark:text-slate-50">{sale.signupDate}</p>
                                <p className="font-medium text-slate-900 dark:text-slate-50">{sale.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DashboardPage;
