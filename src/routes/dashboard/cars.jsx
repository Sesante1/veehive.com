import React, { useState, useMemo, useCallback } from "react";
import {
    MoreVertical,
    X,
    Check,
    XCircle,
    Calendar,
    DollarSign,
    MapPin,
    Car as CarIcon,
    Users,
    Fuel,
    Gauge,
    Shield,
    Ban,
    Clock,
    Eye,
    RefreshCw,
    AlertCircle,
    FileText,
    Search,
} from "lucide-react";
import { useCars } from "../../hooks/useCars";
import { carService } from "../../services/carService";

const StatCard = ({ title, count, icon, color = "blue", active, onClick }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
        gray: "bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
    };

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-lg ${
                active ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            }`}
        >
            <div className={`mb-2 inline-block rounded-lg p-2 ${colors[color]}`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </div>
    );
};

const CarManagement = () => {
    const { cars: allCars, loading, error, stats } = useCars();

    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedCar, setSelectedCar] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [rejectRemarks, setRejectRemarks] = useState("");
    const [suspendReason, setSuspendReason] = useState("");
    const [carToReject, setCarToReject] = useState(null);
    const [carToSuspend, setCarToSuspend] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const cars = useMemo(() => {
        let filtered = allCars.filter((c) => !c.isDeleted);

        // Apply status filter
        if (filterStatus === "pending") {
            filtered = filtered.filter((c) => c.status === "pending");
        } else if (filterStatus === "active") {
            filtered = filtered.filter((c) => c.status === "active");
        } else if (filterStatus === "rejected") {
            filtered = filtered.filter((c) => c.status === "rejected");
        } else if (filterStatus === "suspended") {
            filtered = filtered.filter((c) => c.status === "suspended");
        }

        // ✅ ADDED: Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((car) => {
                return (
                    car.id?.toLowerCase().includes(query) ||
                    car.make?.toLowerCase().includes(query) ||
                    car.model?.toLowerCase().includes(query) ||
                    car.ownerInfo?.displayName?.toLowerCase().includes(query) ||
                    car.ownerInfo?.email?.toLowerCase().includes(query)
                );
            });
        }

        return filtered;
    }, [allCars, filterStatus, searchQuery]); // ✅ ADDED: searchQuery to dependencies

    // 🔥 OPTIMIZATION: Use useCallback for handlers
    const handleRowClick = useCallback((car) => {
        setSelectedCar(car);
        setSelectedImageIndex(0);
        setShowModal(true);
        setActiveDropdown(null);
    }, []);

    const handleApproveCar = useCallback(
        async (carId) => {
            try {
                await carService.approveCar(carId);
                setActiveDropdown(null);

                if (selectedCar?.id === carId) {
                    setSelectedCar((prev) => ({
                        ...prev,
                        status: "active",
                        isActive: true,
                        remarks: null,
                    }));
                }

                alert("✅ Car approved successfully!");
            } catch (error) {
                console.error("Error approving car:", error);
                alert("❌ Failed to approve car: " + error.message);
            }
        },
        [selectedCar],
    );

    const handleRejectClick = useCallback((carId) => {
        setCarToReject(carId);
        setShowRejectModal(true);
        setActiveDropdown(null);
    }, []);

    const handleRejectSubmit = useCallback(async () => {
        if (!rejectRemarks.trim()) {
            alert("Please provide remarks for rejection");
            return;
        }

        try {
            await carService.rejectCar(carToReject, rejectRemarks);

            if (selectedCar?.id === carToReject) {
                setSelectedCar((prev) => ({
                    ...prev,
                    status: "rejected",
                    isActive: false,
                    remarks: rejectRemarks,
                }));
            }

            setShowRejectModal(false);
            setRejectRemarks("");
            setCarToReject(null);

            alert("✅ Car rejected successfully!");
        } catch (error) {
            console.error("Error rejecting car:", error);
            alert("❌ Failed to reject car: " + error.message);
        }
    }, [carToReject, rejectRemarks, selectedCar]);

    const handleSuspendClick = useCallback((carId) => {
        setCarToSuspend(carId);
        setShowSuspendModal(true);
        setActiveDropdown(null);
    }, []);

    const handleSuspendSubmit = useCallback(async () => {
        if (!suspendReason.trim()) {
            alert("Please provide a reason for suspension");
            return;
        }

        try {
            await carService.suspendCar(carToSuspend, suspendReason);
            setShowSuspendModal(false);
            setSuspendReason("");
            setCarToSuspend(null);

            if (selectedCar?.id === carToSuspend) {
                setSelectedCar((prev) => ({
                    ...prev,
                    status: "suspended",
                    isActive: false,
                }));
            }

            alert("✅ Car suspended successfully!");
        } catch (error) {
            console.error("Error suspending car:", error);
            alert("❌ Failed to suspend car: " + error.message);
        }
    }, [carToSuspend, suspendReason, selectedCar]);

    const handleReactivateCar = useCallback(
        async (carId) => {
            if (confirm("Are you sure you want to reactivate this car?")) {
                try {
                    await carService.reactivateCar(carId);
                    setActiveDropdown(null);

                    if (selectedCar?.id === carId) {
                        setSelectedCar((prev) => ({
                            ...prev,
                            status: "active",
                            isActive: true,
                            remarks: null,
                        }));
                    }

                    alert("✅ Car reactivated successfully!");
                } catch (error) {
                    console.error("Error reactivating car:", error);
                    alert("❌ Failed to reactivate car: " + error.message);
                }
            }
        },
        [selectedCar],
    );

    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            suspended: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        };

        return (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-800"}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return "N/A";
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading cars...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Please wait</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Error loading cars</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
            {/* Header */}
            <div className="mb-8">
                <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
                    <CarIcon size={32} />
                    Car Management
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Manage car listings, approvals, and availability</p>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <StatCard
                    title="All Cars"
                    count={stats.total}
                    icon={<CarIcon size={20} />}
                    active={filterStatus === "all"}
                    onClick={() => setFilterStatus("all")}
                    color="blue"
                />
                <StatCard
                    title="Pending"
                    count={stats.pending}
                    icon={<Clock size={20} />}
                    active={filterStatus === "pending"}
                    onClick={() => setFilterStatus("pending")}
                    color="yellow"
                />
                <StatCard
                    title="Active"
                    count={stats.active}
                    icon={<Check size={20} />}
                    active={filterStatus === "active"}
                    onClick={() => setFilterStatus("active")}
                    color="green"
                />
                <StatCard
                    title="Rejected"
                    count={stats.rejected}
                    icon={<XCircle size={20} />}
                    active={filterStatus === "rejected"}
                    onClick={() => setFilterStatus("rejected")}
                    color="red"
                />
                <StatCard
                    title="Suspended"
                    count={stats.suspended}
                    icon={<Ban size={20} />}
                    active={filterStatus === "suspended"}
                    onClick={() => setFilterStatus("suspended")}
                    color="orange"
                />
            </div>

            {/* ✅ ADDED: Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search by ID, make, model, or owner..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Found {cars.length} result{cars.length !== 1 ? "s" : ""} for "{searchQuery}"
                    </p>
                )}
            </div>

            {/* Cars Table */}
            <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
                {cars.length === 0 ? (
                    <div className="p-12 text-center">
                        <CarIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{searchQuery ? "No cars found" : "No cars found"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {searchQuery
                                ? `No results match "${searchQuery}"`
                                : filterStatus === "all"
                                  ? "No cars have been listed yet"
                                  : `No ${filterStatus} cars`}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-700">
                                <tr className="bg-gray-50 dark:bg-gray-800">
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                        Image
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                        Car Info
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                        Owner
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                        Daily Rate
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {cars.map((car) => (
                                    <tr
                                        key={car.id}
                                        onClick={() => handleRowClick(car)}
                                        className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-6 py-4">
                                            <img
                                                src={car.images?.[0]?.url || "/api/placeholder/100/60"}
                                                alt={`${car.make} ${car.model}`}
                                                className="h-16 w-24 rounded-lg object-cover"
                                                onError={(e) => {
                                                    e.target.src = "/api/placeholder/100/60";
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {car.make} {car.model}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {car.year} • {car.carType}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                {car.transmission} • {car.fuel}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={car.ownerInfo?.photoURL || "/api/placeholder/32/32"}
                                                    alt={car.ownerInfo?.displayName}
                                                    className="h-8 w-8 rounded-full"
                                                    onError={(e) => {
                                                        e.target.src = "/api/placeholder/32/32";
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {car.ownerInfo?.displayName || "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{car.ownerInfo?.email || "N/A"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(car.dailyRate)}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">per day</p>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(car.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin
                                                    size={14}
                                                    className="text-gray-400"
                                                />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {car.location?.address?.substring(0, 30)}...
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === car.id ? null : car.id);
                                                    }}
                                                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <MoreVertical size={20} />
                                                </button>

                                                {activeDropdown === car.id && (
                                                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRowClick(car);
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <Eye size={16} />
                                                            View Details
                                                        </button>

                                                        {/* PENDING: Only Approve and Reject */}
                                                        {car.status === "pending" && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleApproveCar(car.id);
                                                                    }}
                                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-green-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                                                >
                                                                    <Check size={16} />
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRejectClick(car.id);
                                                                    }}
                                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                                                >
                                                                    <XCircle size={16} />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* ACTIVE: Only Suspend */}
                                                        {car.status === "active" && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSuspendClick(car.id);
                                                                }}
                                                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-orange-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                                            >
                                                                <Ban size={16} />
                                                                Suspend
                                                            </button>
                                                        )}

                                                        {/* SUSPENDED: Only Reactivate */}
                                                        {car.status === "suspended" && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleReactivateCar(car.id);
                                                                }}
                                                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-blue-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                                            >
                                                                <RefreshCw size={16} />
                                                                Reactivate
                                                            </button>
                                                        )}

                                                        {/* REJECTED: No actions */}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Car Details Modal */}
            {showModal && selectedCar && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {selectedCar.make} {selectedCar.model}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Image Gallery */}
                            {selectedCar.images && selectedCar.images.length > 0 && (
                                <div className="mb-6">
                                    <img
                                        src={selectedCar.images[selectedImageIndex]?.url || "/api/placeholder/800/400"}
                                        alt={`${selectedCar.make} ${selectedCar.model}`}
                                        className="mb-4 h-80 w-full rounded-xl object-cover"
                                        onError={(e) => {
                                            e.target.src = "/api/placeholder/800/400";
                                        }}
                                    />
                                    <div className="grid grid-cols-4 gap-2">
                                        {selectedCar.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img.url || "/api/placeholder/200/150"}
                                                alt={`View ${idx + 1}`}
                                                onClick={() => setSelectedImageIndex(idx)}
                                                className={`h-20 w-full cursor-pointer rounded-lg object-cover transition-all ${
                                                    selectedImageIndex === idx ? "ring-4 ring-blue-500" : "opacity-70 hover:opacity-100"
                                                }`}
                                                onError={(e) => {
                                                    e.target.src = "/api/placeholder/200/150";
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Car Details */}
                            <div className="mb-6 grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Make & Model</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedCar.make} {selectedCar.model}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Year</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCar.year}</p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Type</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCar.carType}</p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                        <Fuel
                                            size={14}
                                            className="inline"
                                        />{" "}
                                        Fuel
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCar.fuel}</p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                        <Gauge
                                            size={14}
                                            className="inline"
                                        />{" "}
                                        Transmission
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCar.transmission}</p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                        <Users
                                            size={14}
                                            className="inline"
                                        />{" "}
                                        Seats
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCar.seats}</p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                        <DollarSign
                                            size={14}
                                            className="inline"
                                        />{" "}
                                        Daily Rate
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedCar.dailyRate)}</p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Total Trips</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCar.totalTrips || 0}</p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedCar.description && (
                                <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Description</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCar.description}</p>
                                </div>
                            )}

                            {/* Owner Info */}
                            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                <p className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Owner Information</p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedCar.ownerInfo?.photoURL || "/api/placeholder/48/48"}
                                        alt={selectedCar.ownerInfo?.displayName}
                                        className="h-12 w-12 rounded-full"
                                        onError={(e) => {
                                            e.target.src = "/api/placeholder/48/48";
                                        }}
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedCar.ownerInfo?.displayName || "Unknown Owner"}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCar.ownerInfo?.email || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            {selectedCar.location && (
                                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                        <MapPin
                                            size={14}
                                            className="inline"
                                        />{" "}
                                        Location
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCar.location.address}</p>
                                </div>
                            )}

                            {/* Documents */}
                            {selectedCar.documents && (
                                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <p className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                        <FileText
                                            size={14}
                                            className="inline"
                                        />{" "}
                                        Documents
                                    </p>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {selectedCar.documents.certificateOfRegistration && (
                                            <a
                                                href={selectedCar.documents.certificateOfRegistration.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            >
                                                <FileText
                                                    size={16}
                                                    className="text-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Certificate of Registration</span>
                                            </a>
                                        )}
                                        {selectedCar.documents.officialReceipt && (
                                            <a
                                                href={selectedCar.documents.officialReceipt.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            >
                                                <FileText
                                                    size={16}
                                                    className="text-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Official Receipt</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Admin Remarks */}
                            {selectedCar.remarks && (
                                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle
                                            size={20}
                                            className="text-red-600 dark:text-red-400"
                                        />
                                        <div>
                                            <p className="mb-1 font-semibold text-red-800 dark:text-red-400">Admin Remarks</p>
                                            <p className="text-sm text-red-700 dark:text-red-300">{selectedCar.remarks}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="mb-6 grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar
                                            size={12}
                                            className="inline"
                                        />{" "}
                                        Created
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(selectedCar.createdAt)}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar
                                            size={12}
                                            className="inline"
                                        />{" "}
                                        Last Updated
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(selectedCar.updatedAt)}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                {/* PENDING: Show Approve and Reject */}
                                {selectedCar.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => handleApproveCar(selectedCar.id)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                                        >
                                            <Check size={20} />
                                            Approve Car
                                        </button>
                                        <button
                                            onClick={() => handleRejectClick(selectedCar.id)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                                        >
                                            <XCircle size={20} />
                                            Reject
                                        </button>
                                    </>
                                )}

                                {/* ACTIVE: Show Suspend Only */}
                                {selectedCar.status === "active" && (
                                    <button
                                        onClick={() => handleSuspendClick(selectedCar.id)}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-700"
                                    >
                                        <Ban size={20} />
                                        Suspend
                                    </button>
                                )}

                                {/* SUSPENDED: Show Reactivate */}
                                {selectedCar.status === "suspended" && (
                                    <button
                                        onClick={() => handleReactivateCar(selectedCar.id)}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                                    >
                                        <RefreshCw size={20} />
                                        Reactivate
                                    </button>
                                )}

                                {/* REJECTED: No actions, just show message */}
                                {selectedCar.status === "rejected" && (
                                    <div className="w-full rounded-lg bg-gray-100 px-6 py-3 text-center text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                        <AlertCircle
                                            size={20}
                                            className="mr-2 inline"
                                        />
                                        No actions available for rejected cars
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setShowRejectModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Reject Car Listing</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            Please provide a reason for rejection. This will be visible to the car owner.
                        </p>
                        <textarea
                            value={rejectRemarks}
                            onChange={(e) => setRejectRemarks(e.target.value)}
                            placeholder="Enter rejection remarks..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            rows="4"
                        />
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectRemarks("");
                                    setCarToReject(null);
                                }}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
                            >
                                Reject Car
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Modal */}
            {showSuspendModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setShowSuspendModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Suspend Car Listing</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            Temporarily disable this car from being booked. Provide a reason below.
                        </p>
                        <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="Enter suspension reason..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            rows="4"
                        />
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setSuspendReason("");
                                    setCarToSuspend(null);
                                }}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspendSubmit}
                                className="flex-1 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-700"
                            >
                                Suspend Car
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarManagement;
