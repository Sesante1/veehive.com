import React, { useState, useEffect } from "react";
import { MoreVertical, X, Check, XCircle, Calendar, Mail, Phone, MapPin, Shield, FileText, Ban, Clock } from "lucide-react";
import { useUsers } from "../../hooks/userUsers";
import { userService } from "../../services/userService";

// Main Component
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

    // Filter users based on status
    useEffect(() => {
        if (filterStatus === "all") {
            setUsers(allUsers);
        } else if (filterStatus === "pending") {
            setUsers(allUsers.filter(u => 
                u.driversLicense?.frontLicense && 
                !u.verificationStatus || 
                u.verificationStatus === "pending"
            ));
        } else if (filterStatus === "verified") {
            setUsers(allUsers.filter(u => u.verificationStatus === "approved"));
        } else if (filterStatus === "rejected") {
            setUsers(allUsers.filter(u => u.verificationStatus === "rejected"));
        } else if (filterStatus === "suspended") {
            setUsers(allUsers.filter(u => u.status === "suspended"));
        } else if (filterStatus === "banned") {
            setUsers(allUsers.filter(u => u.status === "banned"));
        }
    }, [allUsers, filterStatus]);

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true);
        setActiveDropdown(null);
    };

    const handleApprove = async (userId) => {
        try {
            await userService.approveUser(userId);
            setActiveDropdown(null);
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, verificationStatus: "approved" });
            }
        } catch (error) {
            console.error("Error approving user:", error);
            alert("Failed to approve user");
        }
    };

    const handleRejectClick = (userId) => {
        setUserToReject(userId);
        setShowRejectModal(true);
        setActiveDropdown(null);
    };

    const handleRejectSubmit = async () => {
        if (!rejectRemarks.trim()) {
            alert("Please provide remarks for rejection");
            return;
        }
        try {
            await userService.rejectUser(userToReject, rejectRemarks);
            setShowRejectModal(false);
            setRejectRemarks("");
            setUserToReject(null);
            if (selectedUser?.id === userToReject) {
                setSelectedUser({ ...selectedUser, verificationStatus: "rejected", rejectionRemarks: rejectRemarks });
            }
        } catch (error) {
            console.error("Error rejecting user:", error);
            alert("Failed to reject user");
        }
    };

    const handleBanUser = async (userId) => {
        if (confirm("Are you sure you want to permanently ban this user?")) {
            try {
                await userService.banUser(userId);
                setActiveDropdown(null);
                if (selectedUser?.id === userId) {
                    setSelectedUser({ ...selectedUser, status: "banned" });
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
        if (!days || days <= 0) {
            alert("Please enter a valid number of days");
            return;
        }
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

    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending"}
            </span>
        );
    };

    const getAccountStatusBadge = (status) => {
        if (status === "suspended") {
            return <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Suspended</span>;
        }
        if (status === "banned") {
            return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Banned</span>;
        }
        return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Active</span>;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const countDocuments = (user) => {
        let count = 0;
        if (user.driversLicense?.frontLicense) count++;
        if (user.driversLicense?.backLicense) count++;
        if (user.driversLicense?.selfieWithLicense) count++;
        if (user.identityVerification?.frontId) count++;
        if (user.identityVerification?.backId) count++;
        if (user.identityVerification?.selfieWithId) count++;
        return count;
    };

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <h1 className="title">Users Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filterStatus === "all"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus("pending")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filterStatus === "pending"
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus("verified")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filterStatus === "verified"
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                    >
                        Verified
                    </button>
                    <button
                        onClick={() => setFilterStatus("rejected")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filterStatus === "rejected"
                                ? "bg-red-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                    >
                        Rejected
                    </button>
                    <button
                        onClick={() => setFilterStatus("suspended")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filterStatus === "suspended"
                                ? "bg-orange-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                    >
                        Suspended
                    </button>
                    <button
                        onClick={() => setFilterStatus("banned")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            filterStatus === "banned"
                                ? "bg-gray-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                    >
                        Banned
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <p className="card-title">Users ({users.length})</p>
                </div>
                <div className="card-body p-0">
                    <div className="relative h-[700px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">ID</th>
                                    <th className="table-head">Name</th>
                                    <th className="table-head">Email</th>
                                    <th className="table-head">Role</th>
                                    <th className="table-head">Verification</th>
                                    <th className="table-head">Account Status</th>
                                    <th className="table-head">Docs</th>
                                    <th className="table-head">Signup Date</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="table-cell text-center">Loading...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="table-cell text-center">No users found</td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            onClick={() => handleRowClick(user)}
                                            className="table-row cursor-pointer"
                                        >
                                            <td className="table-cell align-middle">{index + 1}</td>
                                            <td className="table-cell align-middle">
                                                <div className="flex items-center gap-x-3">
                                                    <img
                                                        src={user.profileImage || "https://via.placeholder.com/40"}
                                                        alt={user.firstName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <p className="font-medium">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="table-cell align-middle">{user.email}</td>
                                            <td className="table-cell align-middle">
                                                {user.role?.admin ? "Admin" : user.role?.driver ? "Driver" : "User"}
                                            </td>
                                            <td className="table-cell align-middle">
                                                {getStatusBadge(user.verificationStatus)}
                                            </td>
                                            <td className="table-cell align-middle">
                                                {getAccountStatusBadge(user.status)}
                                            </td>
                                            <td className="table-cell align-middle">{countDocuments(user)}</td>
                                            <td className="table-cell align-middle">{formatDate(user.createdAt)}</td>
                                            <td className="table-cell align-middle" onClick={(e) => e.stopPropagation()}>
                                                <div className="relative flex items-center gap-x-4">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                        className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>

                                                    {activeDropdown === user.id && (
                                                        <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                                                            <button
                                                                onClick={() => handleApprove(user.id)}
                                                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-green-600 hover:bg-slate-100 dark:text-green-400 dark:hover:bg-slate-700"
                                                            >
                                                                <Check size={16} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectClick(user.id)}
                                                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-700"
                                                            >
                                                                <XCircle size={16} />
                                                                Reject
                                                            </button>
                                                            <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                                                            <button
                                                                onClick={() => handleSuspendClick(user.id)}
                                                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-orange-600 hover:bg-slate-100 dark:text-orange-400 dark:hover:bg-slate-700"
                                                            >
                                                                <Clock size={16} />
                                                                Suspend
                                                            </button>
                                                            <button
                                                                onClick={() => handleBanUser(user.id)}
                                                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-700"
                                                            >
                                                                <Ban size={16} />
                                                                Ban
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X size={24} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <div className="flex items-center gap-6 border-b border-gray-200 pb-6 dark:border-gray-700">
                                <img src={selectedUser.profileImage || "https://via.placeholder.com/96"} alt={selectedUser.firstName} className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-600" />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-2">
                                        {getStatusBadge(selectedUser.verificationStatus)}
                                        {getAccountStatusBadge(selectedUser.status)}
                                        {selectedUser.phoneVerified && (
                                            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                <Shield size={12} />
                                                Phone Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-750">
                                    <Mail className="mt-1 text-blue-600 dark:text-blue-400" size={20} />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-750">
                                    <Phone className="mt-1 text-green-600 dark:text-green-400" size={20} />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Phone</p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 md:col-span-2 dark:bg-gray-750">
                                    <MapPin className="mt-1 text-red-600 dark:text-red-400" size={20} />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Address</p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-750">
                                    <Calendar className="mt-1 text-purple-600 dark:text-purple-400" size={20} />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Birth Date</p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.birthDate || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-750">
                                    <FileText className="mt-1 text-orange-600 dark:text-orange-400" size={20} />
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Documents</p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{countDocuments(selectedUser)} submitted</p>
                                    </div>
                                </div>
                            </div>

                            {selectedUser.driversLicense && (
                                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <h4 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Driver's License</h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        {selectedUser.driversLicense.frontLicense && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Front License</p>
                                                <img src={selectedUser.driversLicense.frontLicense.url} alt="Front License" className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                                            </div>
                                        )}
                                        {selectedUser.driversLicense.backLicense && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Back License</p>
                                                <img src={selectedUser.driversLicense.backLicense.url} alt="Back License" className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                                            </div>
                                        )}
                                        {selectedUser.driversLicense.selfieWithLicense && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Selfie with License</p>
                                                <img src={selectedUser.driversLicense.selfieWithLicense.url} alt="Selfie" className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedUser.identityVerification && (
                                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <h4 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Identity Verification</h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        {selectedUser.identityVerification.frontId && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Front ID</p>
                                                <img src={selectedUser.identityVerification.frontId.url} alt="Front ID" className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                                            </div>
                                        )}
                                        {selectedUser.identityVerification.backId && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Back ID</p>
                                                <img src={selectedUser.identityVerification.backId.url} alt="Back ID" className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                                            </div>
                                        )}
                                        {selectedUser.identityVerification.selfieWithId && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Selfie with ID</p>
                                                <img src={selectedUser.identityVerification.selfieWithId.url} alt="Selfie" className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedUser.verificationStatus === "rejected" && selectedUser.rejectionRemarks && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                    <p className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">Rejection Remarks</p>
                                    <p className="mt-1 text-sm text-red-800 dark:text-red-300">{selectedUser.rejectionRemarks}</p>
                                </div>
                            )}

                            {selectedUser.status === "suspended" && selectedUser.suspendedUntil && (
                                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                                    <p className="text-xs font-semibold uppercase text-orange-600 dark:text-orange-400">Suspension Info</p>
                                    <p className="mt-1 text-sm text-orange-800 dark:text-orange-300">
                                        Suspended until: {formatDate(selectedUser.suspendedUntil)}
                                    </p>
                                    {selectedUser.suspensionReason && (
                                        <p className="mt-1 text-sm text-orange-800 dark:text-orange-300">
                                            Reason: {selectedUser.suspensionReason}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                                <button
                                    onClick={() => handleApprove(selectedUser.id)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                                >
                                    <Check size={20} />
                                    Approve
                                </button>
                                <button
                                    onClick={() => {
                                        setUserToReject(selectedUser.id);
                                        setShowRejectModal(true);
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                                >
                                    <XCircle size={20} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Reject User Verification</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Please provide a reason for rejection:</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setShowSuspendModal(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Suspend User</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Temporarily suspend user account:</p>
                        
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Suspension Duration (days)
                            </label>
                            <input
                                type="number"
                                value={suspendDays}
                                onChange={(e) => setSuspendDays(e.target.value)}
                                placeholder="Enter number of days"
                                min="1"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reason for Suspension
                            </label>
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