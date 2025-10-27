import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";
import { Search, Filter, AlertCircle, Shield, MessageSquare, Eye, Check, X, Clock, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/layouts/footer";

const ReportsPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [reasonFilter, setReasonFilter] = useState("all");
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch reports in real-time
    useEffect(() => {
        console.log("🔥 Setting up reports listener...");

        const reportsRef = collection(db, "reports");
        const q = query(reportsRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const reportsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setReports(reportsData);
                setLoading(false);
            },
            (error) => {
                console.error("❌ Error fetching reports:", error);
                setLoading(false);
            },
        );

        return () => {
            console.log("🔌 Cleaning up reports listener");
            unsubscribe();
        };
    }, []);

    // Filter reports
    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            report.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.reporterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.reasonText.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || report.status === statusFilter;
        const matchesReason = reasonFilter === "all" || report.reason === reasonFilter;

        return matchesSearch && matchesStatus && matchesReason;
    });

    // Get status counts
    const statusCounts = {
        all: reports.length,
        pending: reports.filter((r) => r.status === "pending").length,
        reviewed: reports.filter((r) => r.status === "reviewed").length,
        resolved: reports.filter((r) => r.status === "resolved").length,
        dismissed: reports.filter((r) => r.status === "dismissed").length,
    };

    // Update report status
    const handleUpdateStatus = async (reportId, newStatus, notes) => {
        try {
            setActionLoading(true);

            const reportRef = doc(db, "reports", reportId);
            await updateDoc(reportRef, {
                status: newStatus,
                reviewedBy: "admin", // Replace with actual admin ID
                reviewNotes: notes || "",
                updatedAt: Timestamp.now(),
            });

            console.log("✅ Report status updated");
            setShowDetailModal(false);
        } catch (error) {
            console.error("❌ Error updating report:", error);
            alert("Failed to update report status");
        } finally {
            setActionLoading(false);
        }
    };

    // View car details
    const handleViewCar = (carId) => {
        navigate(`/dashboard/cars/${carId}`);
    };

    // View reporter profile
    const handleViewReporter = (reporterId) => {
        navigate(`/dashboard/users/${reporterId}`);
    };

    // Get reason icon
    const getReasonIcon = (reason) => {
        switch (reason) {
            case "inappropriate":
                return (
                    <AlertCircle
                        size={20}
                        className="text-red-500"
                    />
                );
            case "misleading":
                return (
                    <Shield
                        size={20}
                        className="text-orange-500"
                    />
                );
            case "other":
                return (
                    <MessageSquare
                        size={20}
                        className="text-blue-500"
                    />
                );
            default:
                return (
                    <MessageSquare
                        size={20}
                        className="text-blue-500"
                    />
                );
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
            reviewed: "bg-blue-100 text-blue-700 border-blue-300",
            resolved: "bg-green-100 text-green-700 border-green-300",
            dismissed: "bg-gray-100 text-gray-700 border-gray-300",
        };

        return (
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status] || styles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Format date
    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate();
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get time ago
    const getTimeAgo = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate();
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return formatDate(timestamp);
    };

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title">Reports Management</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Review and manage user-reported listings</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="card">
                    <div className="card-body">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Reports</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{statusCounts.all}</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Reviewed</p>
                        <p className="text-2xl font-bold text-blue-600">{statusCounts.reviewed}</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Resolved</p>
                        <p className="text-2xl font-bold text-green-600">{statusCounts.resolved}</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Dismissed</p>
                        <p className="text-2xl font-bold text-gray-600">{statusCounts.dismissed}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Search */}
                        <div className="relative max-w-md flex-1">
                            <Search
                                size={20}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by car name, email, or reason..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                                <option value="dismissed">Dismissed</option>
                            </select>

                            <select
                                value={reasonFilter}
                                onChange={(e) => setReasonFilter(e.target.value)}
                                className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            >
                                <option value="all">All Reasons</option>
                                <option value="inappropriate">Inappropriate</option>
                                <option value="misleading">Misleading</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Reports List ({filteredReports.length})</p>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-slate-600 dark:text-slate-400">Loading reports...</div>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle
                                size={48}
                                className="mb-3 text-slate-300 dark:text-slate-600"
                            />
                            <p className="text-slate-600 dark:text-slate-400">No reports found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                            Report
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                            Car
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                            Reporter
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredReports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getReasonIcon(report.reason)}
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        #{report.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{report.carName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {report.carId.slice(0, 8)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{report.reasonText}</p>
                                                    {report.details && (
                                                        <p className="max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                                                            {report.details}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-slate-900 dark:text-slate-100">{report.reporterEmail}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{report.reportedBy.slice(0, 8)}...</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-slate-900 dark:text-slate-100">{getTimeAgo(report.createdAt)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReport(report);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-slate-800">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Report Details</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">#{selectedReport.id}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-6 p-6">
                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                {getStatusBadge(selectedReport.status)}
                            </div>

                            {/* Car Info */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Reported Car</label>
                                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{selectedReport.carName}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">ID: {selectedReport.carId}</p>
                                    </div>
                                    <button
                                        onClick={() => handleViewCar(selectedReport.carId)}
                                        className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                                    >
                                        <ExternalLink size={16} />
                                        View Car
                                    </button>
                                </div>
                            </div>

                            {/* Reporter Info */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Reporter</label>
                                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{selectedReport.reporterEmail}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">User ID: {selectedReport.reportedBy}</p>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Report Reason</label>
                                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                    {getReasonIcon(selectedReport.reason)}
                                    <span className="font-medium text-slate-900 dark:text-slate-100">{selectedReport.reasonText}</span>
                                </div>
                            </div>

                            {/* Details */}
                            {selectedReport.details && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Additional Details</label>
                                    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReport.details}</p>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Reported On</label>
                                    <p className="text-sm text-slate-900 dark:text-slate-100">{formatDate(selectedReport.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Last Updated</label>
                                    <p className="text-sm text-slate-900 dark:text-slate-100">{formatDate(selectedReport.updatedAt)}</p>
                                </div>
                            </div>

                            {/* Review Notes */}
                            {selectedReport.reviewNotes && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Review Notes</label>
                                    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReport.reviewNotes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
                            {selectedReport.status === "pending" && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReport.id, "reviewed")}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        <Eye size={16} />
                                        Mark as Reviewed
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReport.id, "dismissed")}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
                                    >
                                        <X size={16} />
                                        Dismiss
                                    </button>
                                </>
                            )}

                            {selectedReport.status === "reviewed" && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReport.id, "resolved")}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
                                    >
                                        <Check size={16} />
                                        Mark as Resolved
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReport.id, "dismissed")}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
                                    >
                                        <X size={16} />
                                        Dismiss
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ReportsPage;
