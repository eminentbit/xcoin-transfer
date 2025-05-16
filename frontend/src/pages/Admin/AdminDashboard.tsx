import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  X,
  RefreshCw,
  Download,
  Search,
  Eye,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TransferRequest } from "@/utils/types";
import { sampleTransactions } from "@/utils/data";

const AdminDashboard: React.FC = () => {
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(
    []
  );
  const [filteredRequests, setFilteredRequests] = useState<TransferRequest[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy] = useState<string>("date");
  const [selectedRequest, setSelectedRequest] =
    useState<TransferRequest | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const navigate = useNavigate();

  // Fetch transfer requests
  const fetchTransferRequests = async () => {
    setIsLoading(true);
    try {
      const url = import.meta.env.VITE_ROOT_URL;
      const response = await axios.get(`${url}/admin/transactions`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      // If in development and no transactions returned, use sample data
      const data =
        import.meta.env.DEV && response.data.length < 1
          ? sampleTransactions
          : response.data;

      setTransferRequests(data);
      if (import.meta.env.DEV) {
        console.log(data);
      }
      setFilteredRequests(data);
    } catch (error) {
      console.error("Error fetching transfer requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and filtering
  useEffect(() => {
    fetchTransferRequests();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = [...transferRequests];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((request) => request.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.username.toLowerCase().includes(query) ||
          request.email.toLowerCase().includes(query) ||
          request.id.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(
        (request) => new Date(request.createdAt) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (request) => new Date(request.createdAt) <= new Date(dateTo)
      );
    }

    // Sort
    const sorted = filtered.sort((a, b) => {
      return sortBy === "amount"
        ? a.amount - b.amount
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredRequests(sorted);
  }, [transferRequests, filterStatus, searchQuery, dateFrom, dateTo, sortBy]);

  // Approve request
  const handleApprove = async (id: string) => {
    try {
      const updatedRequests = transferRequests.map((request) =>
        request.id === id
          ? { ...request, status: "approved" as const }
          : request
      );

      setTransferRequests(updatedRequests);
      alert(
        `Transfer request ${id} approved! User will be notified to upload QR code.`
      );
      setShowModal(false);
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  // Decline request
  const handleDecline = async (id: string) => {
    try {
      const updatedRequests = transferRequests.map((request) =>
        request.id === id
          ? { ...request, status: "declined" as const }
          : request
      );

      setTransferRequests(updatedRequests);
      alert(`Transfer request ${id} declined!`);
      setShowModal(false);
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  // View request details
  const viewRequestDetails = (request: TransferRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Date & Time",
      "Transaction ID",
      "Amount (RMB)",
      "User",
      "Status",
    ];
    const csvRows = [headers.join(",")];

    filteredRequests.forEach((request) => {
      const row = [
        formatDate(request.createdAt),
        request.id,
        request.amount.toString(),
        request.username,
        request.status,
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transfer_requests.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Bell size={20} />
            </button>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="ml-2 font-medium">Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Money Transfer Requests</h2>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Download size={16} className="mr-2" /> Export CSV
              </button>
              <button
                type="button"
                className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    fetchTransferRequests();
                  }, 2000);
                }}
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email or ID"
                  className="w-full border p-2 pl-8 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  size={16}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
              <input
                type="date"
                className="w-full border p-2 rounded-lg"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
              />
              <input
                type="date"
                className="w-full border p-2 rounded-lg"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
              />
              <select
                title="filter"
                className="w-full border p-2 rounded-lg"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No transfer requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        navigate(`/admin/transaction/${request.id}`);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.amount} XCoin
                        </div>
                        <div className="text-sm text-gray-500">
                          ≈ {request.targetAmount}{" "}
                          {request.targetCurrency.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {request.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(request.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDecline(request.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => viewRequestDetails(request)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">
                Pending Requests
              </h3>
              <p className="mt-1 text-2xl font-semibold text-blue-900">
                {transferRequests.filter((r) => r.status === "pending").length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">
                Approved Today
              </h3>
              <p className="mt-1 text-2xl font-semibold text-green-900">
                {
                  transferRequests.filter(
                    (r) =>
                      r.status === "approved" &&
                      new Date(r.createdAt).toDateString() ===
                        new Date().toDateString()
                  ).length
                }
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">
                Total Volume (RMB Today)
              </h3>
              <p className="mt-1 text-2xl font-semibold text-purple-900">
                {transferRequests
                  .filter(
                    (r) =>
                      r.status === "approved" &&
                      new Date(r.createdAt).toDateString() ===
                        new Date().toDateString()
                  )
                  .reduce((sum, r) => sum + r.rmbAmount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Transfer Request Details</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Request ID</p>
                <p className="font-medium">{selectedRequest.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status.charAt(0).toUpperCase() +
                    selectedRequest.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium">{selectedRequest.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedRequest.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{selectedRequest.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {formatDate(selectedRequest.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">XCoin Amount</p>
                <p className="font-medium">
                  {selectedRequest.xCoinAmount} XCoin
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Exchange Rate</p>
                <p className="font-medium">
                  1 XCoin = {selectedRequest.exchangeRate} RMB
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">RMB Amount</p>
                <p className="font-medium text-lg">
                  {selectedRequest.rmbAmount.toLocaleString()} RMB
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Process Information</h4>
              <p className="text-sm text-gray-600">
                {selectedRequest.status === "pending"
                  ? "Upon approval, the user will be prompted to upload their WeChat/Alipay QR code. The system will automatically trigger a withdrawal request from their payment method."
                  : selectedRequest.status === "approved"
                  ? "This request has been approved. The user has been notified to upload their WeChat/Alipay QR code. Awaiting their confirmation for the final transfer."
                  : "This request has been declined. No further action is required."}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>

              {selectedRequest.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDecline(selectedRequest.id)}
                    className="px-4 py-2 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                </>
              )}

              {selectedRequest.status === "approved" && (
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                >
                  <Download size={16} className="inline mr-1 -mt-1" />
                  Download Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
