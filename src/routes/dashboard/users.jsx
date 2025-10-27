import React, { useState, useEffect } from "react";
import { MoreVertical, X, Check, XCircle, Calendar, Mail, Phone, MapPin, Shield, FileText, Ban, Clock, Car, IdCard } from "lucide-react";
import { useUsers } from "../../hooks/userUsers";
import { userService } from "../../services/userService";

const UserManagement = () => {
    const { users: allUsers, loading } = useUsers();
    const [users, setUsers] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [rejectRemarks, setRejectRemarks] = useState("");
    const [suspendDays, setSuspendDays] = useState("");
    const [suspendReason, setSuspendReason] = useState("");
    const [userToReject, setUserToReject] = useState(null);
    const [userToSuspend, setUserToSuspend] = useState(null);
    const [verificationType, setVerificationType] = useState(null); // "license" or "identity"

    // Filter users based on status
    useEffect(() => {
        if (filterStatus === "all") {
            setUsers(allUsers);
        } else if (filterStatus === "pending_guests") {
            // Pending Guests: Users with pending DRIVER'S LICENSE verification
            setUsers(allUsers.filter((u) => u.driversLicense?.verificationStatus === "pending"));
        } else if (filterStatus === "pending_hosters") {
            // Pending Hosters: Users with pending IDENTITY verification
            setUsers(allUsers.filter((u) => u.identityVerification?.verificationStatus === "pending"));
        } else if (filterStatus === "verified_guests") {
            // Verified Guests: Users with approved driver's license
            setUsers(allUsers.filter((u) => u.driversLicense?.verificationStatus === "approved"));
        } else if (filterStatus === "verified_hosters") {
            // Verified Hosters: Users with approved identity
            setUsers(allUsers.filter((u) => u.identityVerification?.verificationStatus === "approved"));
        } else if (filterStatus === "declined_guests") {
            // Declined Guests: Users with declined driver's license
            setUsers(allUsers.filter((u) => u.driversLicense?.verificationStatus === "declined"));
        } else if (filterStatus === "declined_hosters") {
            // Declined Hosters: Users with declined identity
            setUsers(allUsers.filter((u) => u.identityVerification?.verificationStatus === "declined"));
        } else if (filterStatus === "suspended") {
            setUsers(allUsers.filter((u) => u.status === "suspended"));
        } else if (filterStatus === "banned") {
            setUsers(allUsers.filter((u) => u.status === "banned"));
        }
    }, [allUsers, filterStatus]);

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true);
        setActiveDropdown(null);
    };

    const handleApproveLicense = async (userId) => {
        try {
            await userService.approveLicenseVerification(userId);
            setActiveDropdown(null);
            if (selectedUser?.id === userId) {
                const updatedUser = { ...selectedUser };
                updatedUser.driversLicense.verificationStatus = "approved";
                updatedUser.role = { ...updatedUser.role, Guest: true };
                setSelectedUser(updatedUser);
            }
        } catch (error) {
            console.error("Error approving license:", error);
            alert("Failed to approve license verification");
        }
    };

    const handleApproveIdentity = async (userId) => {
        try {
            await userService.approveIdentityVerification(userId);
            setActiveDropdown(null);
            if (selectedUser?.id === userId) {
                const updatedUser = { ...selectedUser };
                updatedUser.identityVerification.verificationStatus = "approved";
                updatedUser.role = { ...updatedUser.role, Hoster: true };
                setSelectedUser(updatedUser);
            }
        } catch (error) {
            console.error("Error approving identity:", error);
            alert("Failed to approve identity verification");
        }
    };

    const handleRejectClick = (userId, type) => {
        setUserToReject(userId);
        setVerificationType(type); // "license" or "identity"
        setShowRejectModal(true);
        setActiveDropdown(null);
    };

    const handleRejectSubmit = async () => {
        if (!rejectRemarks.trim()) {
            alert("Please provide remarks for rejection");
            return;
        }
        try {
            if (verificationType === "license") {
                await userService.rejectLicenseVerification(userToReject, rejectRemarks);
                if (selectedUser?.id === userToReject) {
                    const updatedUser = { ...selectedUser };
                    updatedUser.driversLicense.verificationStatus = "declined";
                    updatedUser.driversLicense.adminNote = rejectRemarks;
                    updatedUser.role = { ...updatedUser.role, Guest: false };
                    setSelectedUser(updatedUser);
                }
            } else if (verificationType === "identity") {
                await userService.rejectIdentityVerification(userToReject, rejectRemarks);
                if (selectedUser?.id === userToReject) {
                    const updatedUser = { ...selectedUser };
                    updatedUser.identityVerification.verificationStatus = "declined";
                    updatedUser.identityVerification.adminNote = rejectRemarks;
                    updatedUser.role = { ...updatedUser.role, Hoster: false };
                    setSelectedUser(updatedUser);
                }
            }
            setShowRejectModal(false);
            setRejectRemarks("");
            setUserToReject(null);
            setVerificationType(null);
        } catch (error) {
            console.error("Error rejecting verification:", error);
            alert("Failed to reject verification");
        }
    };

    const handleBanUser = async (userId) => {
        if (confirm("Are you sure you want to permanently ban this user? This will revoke both Guest and Hoster roles.")) {
            try {
                await userService.banUser(userId);
                setActiveDropdown(null);
                if (selectedUser?.id === userId) {
                    setSelectedUser({ ...selectedUser, status: "banned", role: { Guest: false, Hoster: false } });
                }
            } catch (error) {
                console.error("Error banning user:", error);
                alert("Failed to ban user");
            }
        }
    };

    const handleSuspendClick = (userId) => {
        setUserToSuspend(userId);
        setShowSuspendModal(true);
        setActiveDropdown(null);
    };

    const handleSuspendSubmit = async () => {
        const days = parseInt(suspendDays);
        // if (!days || days <= 0) {
        //     alert("Please enter a valid number of days");
        //     return;
        // }
        if (!suspendReason.trim()) {
            alert("Please provide a reason for suspension");
            return;
        }
        try {
            await userService.suspendUser(userToSuspend, days, suspendReason);
            setShowSuspendModal(false);
            setSuspendDays("");
            setSuspendReason("");
            setUserToSuspend(null);
            if (selectedUser?.id === userToSuspend) {
                setSelectedUser({ ...selectedUser, status: "suspended" });
            }
        } catch (error) {
            console.error("Error suspending user:", error);
            alert("Failed to suspend user");
        }
    };

    const handleReactivate = async (userId) => {
        if (confirm("Are you sure you want to reactivate this user account?")) {
            try {
                await userService.reactivateUser(userId);
                setActiveDropdown(null);
                if (selectedUser?.id === userId) {
                    setSelectedUser({ ...selectedUser, status: "active" });
                }
            } catch (error) {
                console.error("Error reactivating user:", error);
                alert("Failed to reactivate user");
            }
        }
    };

    const getVerificationStatusBadge = (verificationType) => {
        // For GUESTS: Check driver's license
        // For HOSTERS: Check identity verification
        const verification = verificationType === "guest" ? selectedUser?.driversLicense : selectedUser?.identityVerification;

        const status = verification?.verificationStatus;

        const styles = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };

        if (!status) return null;

        return (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getAccountStatusBadge = (status) => {
        if (status === "suspended") {
            return (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    Suspended
                </span>
            );
        }
        if (status === "banned") {
            return (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                    Banned
                </span>
            );
        }
        return (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Active
            </span>
        );
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        } catch {
            return "Invalid date";
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Manage user verifications - Guests (License) & Hosters (ID)</p>
            </div>

            {/* Filter Tabs */}
            <div className="overflow-x-auto">
                <div className="inline-flex min-w-full gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "all"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        All Users ({allUsers.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("pending_guests")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "pending_guests"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        Pending Guests ({allUsers.filter((u) => u.driversLicense?.verificationStatus === "pending").length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("pending_hosters")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "pending_hosters"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        Pending Hosters ({allUsers.filter((u) => u.identityVerification?.verificationStatus === "pending").length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("verified_guests")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "verified_guests"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        Verified Guests
                    </button>
                    <button
                        onClick={() => setFilterStatus("verified_hosters")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "verified_hosters"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        Verified Hosters
                    </button>
                    <button
                        onClick={() => setFilterStatus("declined_guests")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "declined_guests"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        Declined Guests
                    </button>
                    <button
                        onClick={() => setFilterStatus("declined_hosters")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "declined_hosters"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        Declined Hosters
                    </button>
                    <button
                        onClick={() => setFilterStatus("suspended")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "suspended"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        Suspended
                    </button>
                    <button
                        onClick={() => setFilterStatus("banned")}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                            filterStatus === "banned"
                                ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        Banned
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-1">
                                        <Car size={14} />
                                        Guest Status
                                    </div>
                                    <span className="text-[10px] font-normal text-gray-500">(License)</span>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-1">
                                        <IdCard size={14} />
                                        Hoster Status
                                    </div>
                                    <span className="text-[10px] font-normal text-gray-500">(ID Card)</span>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Account Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Joined
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    onClick={() => handleRowClick(user)}
                                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                                {user.profileImage ? (
                                                    <img
                                                        src={user.profileImage}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                        {user.firstName?.[0]}
                                                        {user.lastName?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white">{user.phoneNumber || "N/A"}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.driversLicense?.verificationStatus ? (
                                            getVerificationStatusBadge("guest")
                                        ) : (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Not submitted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.identityVerification?.verificationStatus ? (
                                            getVerificationStatusBadge("hoster")
                                        ) : (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Not submitted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{getAccountStatusBadge(user.status)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === user.id ? null : user.id);
                                                }}
                                                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            {activeDropdown === user.id && (
                                                <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                                                    {user.driversLicense?.verificationStatus === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApproveLicense(user.id);
                                                                }}
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                            >
                                                                <Check size={16} />
                                                                Approve Guest (License)
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRejectClick(user.id, "license");
                                                                }}
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                            >
                                                                <XCircle size={16} />
                                                                Reject Guest (License)
                                                            </button>
                                                        </>
                                                    )}
                                                    {user.identityVerification?.verificationStatus === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApproveIdentity(user.id);
                                                                }}
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                            >
                                                                <Check size={16} />
                                                                Approve Hoster (ID)
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRejectClick(user.id, "identity");
                                                                }}
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                            >
                                                                <XCircle size={16} />
                                                                Reject Hoster (ID)
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* Show Reactivate for suspended or banned users */}
                                                    {user.status === "suspended" || user.status === "banned" ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReactivate(user.id);
                                                            }}
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                                                        >
                                                            <Check size={16} />
                                                            Reactivate Account
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSuspendClick(user.id);
                                                                }}
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30"
                                                            >
                                                                <Clock size={16} />
                                                                Suspend User
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleBanUser(user.id);
                                                                }}
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                            >
                                                                <Ban size={16} />
                                                                Ban User
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Modal - Continued in next part due to length */}
            {showModal && selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                    {selectedUser.profileImage ? (
                                        <img
                                            src={selectedUser.profileImage}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
                                            {selectedUser.firstName?.[0]}
                                            {selectedUser.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                                    <div className="mt-1 flex gap-2">
                                        {selectedUser.role?.Guest && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                                                <Car size={12} /> Guest
                                            </span>
                                        )}
                                        {selectedUser.role?.Hoster && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                                                <IdCard size={12} /> Hoster
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="space-y-6 p-6">
                            {/* User Information */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                    <Mail
                                        size={20}
                                        className="mt-0.5 text-gray-600 dark:text-gray-400"
                                    />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                    <Phone
                                        size={20}
                                        className="mt-0.5 text-gray-600 dark:text-gray-400"
                                    />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Phone</p>
                                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedUser.phoneNumber || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                    <MapPin
                                        size={20}
                                        className="mt-0.5 text-gray-600 dark:text-gray-400"
                                    />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Address</p>
                                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedUser.address || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                    <Calendar
                                        size={20}
                                        className="mt-0.5 text-gray-600 dark:text-gray-400"
                                    />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Joined</p>
                                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{formatDate(selectedUser.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Driver's License Verification (GUEST ROLE) */}
                            {selectedUser.driversLicense && (
                                <div className="rounded-lg border-2 border-blue-200 bg-white p-4 dark:border-blue-800 dark:bg-gray-800/50">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Car
                                                size={24}
                                                className="text-blue-600"
                                            />
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Driver's License - GUEST ROLE</h3>
                                                <p className="text-xs text-gray-500">For users who want to rent cars</p>
                                            </div>
                                        </div>
                                        {getVerificationStatusBadge("guest")}
                                    </div>

                                    {selectedUser.driversLicense.expirationDate && (
                                        <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                            <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                                                License Expiration Date
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-300">
                                                {selectedUser.driversLicense.expirationDate}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        {selectedUser.driversLicense.frontLicense && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Front License</p>
                                                <img
                                                    src={selectedUser.driversLicense.frontLicense.url}
                                                    alt="Front"
                                                    className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                        )}
                                        {selectedUser.driversLicense.backLicense && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Back License</p>
                                                <img
                                                    src={selectedUser.driversLicense.backLicense.url}
                                                    alt="Back"
                                                    className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                        )}
                                        {selectedUser.driversLicense.selfieWithLicense && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                                    Selfie with License
                                                </p>
                                                <img
                                                    src={selectedUser.driversLicense.selfieWithLicense.url}
                                                    alt="Selfie"
                                                    className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {selectedUser.driversLicense.verificationStatus === "declined" && selectedUser.driversLicense.adminNote && (
                                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                            <p className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">Admin Remarks</p>
                                            <p className="mt-1 text-sm text-red-800 dark:text-red-300">{selectedUser.driversLicense.adminNote}</p>
                                        </div>
                                    )}

                                    {selectedUser.driversLicense.verificationStatus === "pending" && (
                                        <div className="mt-4 flex gap-4">
                                            <button
                                                onClick={() => handleApproveLicense(selectedUser.id)}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                                            >
                                                <Check size={20} />
                                                Approve Guest Role
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(selectedUser.id, "license")}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                                            >
                                                <XCircle size={20} />
                                                Reject Guest Role
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Identity Verification (HOSTER ROLE) */}
                            {selectedUser.identityVerification && (
                                <div className="rounded-lg border-2 border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-800/50">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <IdCard
                                                size={24}
                                                className="text-purple-600"
                                            />
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    Identity Verification - HOSTER ROLE
                                                </h3>
                                                <p className="text-xs text-gray-500">For users who want to rent out cars</p>
                                            </div>
                                        </div>
                                        {getVerificationStatusBadge("hoster")}
                                    </div>

                                    {selectedUser.identityVerification.expirationDate && (
                                        <div className="mb-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                                            <p className="text-xs font-semibold uppercase text-purple-600 dark:text-purple-400">ID Expiration Date</p>
                                            <p className="mt-1 text-lg font-bold text-purple-900 dark:text-purple-300">
                                                {selectedUser.identityVerification.expirationDate}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        {selectedUser.identityVerification.frontId && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Front ID</p>
                                                <img
                                                    src={selectedUser.identityVerification.frontId.url}
                                                    alt="Front ID"
                                                    className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                        )}
                                        {selectedUser.identityVerification.backId && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Back ID</p>
                                                <img
                                                    src={selectedUser.identityVerification.backId.url}
                                                    alt="Back ID"
                                                    className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                        )}
                                        {selectedUser.identityVerification.selfieWithId && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                                    Selfie with ID
                                                </p>
                                                <img
                                                    src={selectedUser.identityVerification.selfieWithId.url}
                                                    alt="Selfie"
                                                    className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {selectedUser.identityVerification.verificationStatus === "declined" &&
                                        selectedUser.identityVerification.adminNote && (
                                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                                <p className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">Admin Remarks</p>
                                                <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                                                    {selectedUser.identityVerification.adminNote}
                                                </p>
                                            </div>
                                        )}

                                    {selectedUser.identityVerification.verificationStatus === "pending" && (
                                        <div className="mt-4 flex gap-4">
                                            <button
                                                onClick={() => handleApproveIdentity(selectedUser.id)}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                                            >
                                                <Check size={20} />
                                                Approve Hoster Role
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(selectedUser.id, "identity")}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                                            >
                                                <XCircle size={20} />
                                                Reject Hoster Role
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Suspension Info */}
                            {selectedUser.status === "suspended" && selectedUser.suspendedUntil && (
                                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                                    <p className="text-xs font-semibold uppercase text-orange-600 dark:text-orange-400">Suspension Info</p>
                                    <p className="mt-1 text-sm text-orange-800 dark:text-orange-300">
                                        Suspended until: {formatDate(selectedUser.suspendedUntil)}
                                    </p>
                                    {selectedUser.suspensionReason && (
                                        <p className="mt-1 text-sm text-orange-800 dark:text-orange-300">Reason: {selectedUser.suspensionReason}</p>
                                    )}
                                </div>
                            )}
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
                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                            Reject {verificationType === "license" ? "Guest (License)" : "Hoster (ID)"} Verification
                        </h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            This will revoke the {verificationType === "license" ? "Guest" : "Hoster"} role. Please provide a reason:
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
                                    setUserToReject(null);
                                    setVerificationType(null);
                                }}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
                            >
                                Reject
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
                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Suspend User</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Temporarily suspend user account:</p>

                        {/* <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Suspension Duration (days)</label>
                            <input
                                type="number"
                                value={suspendDays}
                                onChange={(e) => setSuspendDays(e.target.value)}
                                placeholder="Enter number of days"
                                min="1"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div> */}

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Suspension</label>
                            <textarea
                                value={suspendReason}
                                onChange={(e) => setSuspendReason(e.target.value)}
                                placeholder="Enter suspension reason..."
                                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                rows="3"
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setSuspendDays("");
                                    setSuspendReason("");
                                    setUserToSuspend(null);
                                }}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspendSubmit}
                                className="flex-1 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-700"
                            >
                                Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
