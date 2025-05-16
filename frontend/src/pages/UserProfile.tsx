import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { UserProfile } from "@/utils/types";
import axios from "axios";
import { decryptData, isEncryptedResponse } from "@/utils/CryptoService";

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [savingChanges, setSavingChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const url = `${import.meta.env.VITE_ROOT_URL}/auth/profile`;
      try {
        const response = await axios.get(url, { withCredentials: true });

        if (isEncryptedResponse(response.data)) {
          const decryptedData = await decryptData(response.data);
          if (import.meta.env.DEV) {
            console.log("Decrypted profile data:", decryptedData);
          }
          setTimeout(() => {
            setProfile(decryptedData as UserProfile);
            setFormData(decryptedData as UserProfile);
            setIsLoading(false);
          }, 800);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log(error);
        }
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      if (name.startsWith("notifications.")) {
        const notificationType = name.split(".")[1];
        setFormData({
          ...formData,
          notifications: {
            ...formData.notifications,
            [notificationType]: checked,
          },
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingChanges(true);

    // Simulate API call to update profile
    setTimeout(() => {
      setProfile(formData as UserProfile);
      setIsEditing(false);
      setSavingChanges(false);
      setSuccessMessage("Profile updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 1000);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData(profile as UserProfile);
    setIsEditing(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Format time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get verification level badge
  const getVerificationBadge = (level: string) => {
    switch (level) {
      case "unverified":
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            Unverified
          </span>
        );
      case "basic":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            Basic
          </span>
        );
      case "intermediate":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            Intermediate
          </span>
        );
      case "advanced":
        return (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
            Advanced
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            {level}
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 max-sm:p-3 max-sm:mt-6">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-1">
                My Profile
              </h1>
              <p className="text-gray-600">
                Manage your account information and preferences
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-4 sm:mt-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-sm flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </button>
            )}
          </header>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-md p-8 flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Profile Overview */}
              <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-200">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
                        {profile?.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </button>
                    </div>
                    <h2 className="text-xl font-semibold mb-1">
                      {profile?.name}
                    </h2>
                    <p className="text-gray-600 mb-3 text-sm">
                      {profile?.email}
                    </p>
                    <div className="mb-4">
                      {getVerificationBadge(
                        profile?.verificationLevel || "unverified"
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      User ID: {profile?.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      Member since {formatDate(profile?.joinedDate || "")}
                    </div>
                    {profile?.twoFactorEnabled && (
                      <div className="mt-4 flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        2FA Enabled
                      </div>
                    )}
                  </div>

                  <div className="md:w-2/3 p-6">
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <h3 className="text-lg font-medium mb-3">
                        Account Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Phone Number
                          </p>
                          <p className="font-medium">
                            {profile?.phone || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Country</p>
                          <p className="font-medium">
                            {profile?.country || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Last Login
                          </p>
                          <p className="font-medium">
                            {formatDateTime(profile?.lastLogin || "")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Preferred Currency
                          </p>
                          <p className="font-medium">
                            {profile?.preferredCurrency || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">
                        Security & Verification
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              Two-Factor Authentication
                            </p>
                            <p className="text-sm text-gray-500">
                              Additional security for your account
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`mr-2 text-sm ${
                                profile?.twoFactorEnabled
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {profile?.twoFactorEnabled
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                            <button className="text-blue-500 hover:text-blue-700 text-sm">
                              {profile?.twoFactorEnabled ? "Manage" : "Enable"}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Identity Verification</p>
                            <p className="text-sm text-gray-500">
                              Verify your identity to unlock more features
                            </p>
                          </div>
                          <div>
                            <button className="text-blue-500 hover:text-blue-700 text-sm">
                              {profile?.verificationLevel === "advanced"
                                ? "View Status"
                                : "Upgrade Now"}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-sm text-gray-500">
                              Update your account password
                            </p>
                          </div>
                          <div>
                            <button className="text-blue-500 hover:text-blue-700 text-sm">
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Settings Tabs */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab("personal")}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === "personal"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Personal Information
                    </button>
                    <button
                      onClick={() => setActiveTab("preferences")}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === "preferences"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Preferences
                    </button>
                    <button
                      onClick={() => setActiveTab("notifications")}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === "notifications"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Notifications
                    </button>
                  </nav>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="p-6">
                    {/* Personal Information Tab */}
                    {activeTab === "personal" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={formData.name || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={formData.email || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="phone"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={formData.phone || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="country"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Country
                            </label>
                            <select
                              id="country"
                              name="country"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={formData.country || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            >
                              <option value="">Select Country</option>
                              <option value="United States">
                                United States
                              </option>
                              <option value="Canada">Canada</option>
                              <option value="United Kingdom">
                                United Kingdom
                              </option>
                              <option value="Australia">Australia</option>
                              <option value="Nigeria">Nigeria</option>
                              <option value="Ghana">Ghana</option>
                              <option value="Kenya">Kenya</option>
                              <option value="South Africa">South Africa</option>
                              <option value="China">China</option>
                              <option value="India">India</option>
                              <option value="Japan">Japan</option>
                            </select>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-md">
                            <p className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-500 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              To change sensitive account information, we may
                              require additional verification.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === "preferences" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label
                              htmlFor="language"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Language
                            </label>
                            <select
                              id="language"
                              name="language"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={formData.language || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            >
                              <option value="English">English</option>
                              <option value="French">French</option>
                              <option value="Spanish">Spanish</option>
                              <option value="Chinese">Chinese</option>
                              <option value="Arabic">Arabic</option>
                              <option value="Swahili">Swahili</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="preferredCurrency"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Preferred Currency
                            </label>
                            <select
                              id="preferredCurrency"
                              name="preferredCurrency"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={formData.preferredCurrency || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            >
                              <option value="XCoin">XCoin</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                              <option value="RMB">RMB</option>
                              <option value="NGN">NGN</option>
                              <option value="GHS">GHS</option>
                              <option value="KES">KES</option>
                              <option value="ZAR">ZAR</option>
                              <option value="JPY">JPY</option>
                            </select>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-4">
                            Time & Display Preferences
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label
                                htmlFor="timeZone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Time Zone
                              </label>
                              <select
                                id="timeZone"
                                name="timeZone"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                disabled={!isEditing}
                                defaultValue="UTC"
                              >
                                <option value="UTC">
                                  UTC (Coordinated Universal Time)
                                </option>
                                <option value="EST">
                                  EST (Eastern Standard Time)
                                </option>
                                <option value="PST">
                                  PST (Pacific Standard Time)
                                </option>
                                <option value="GMT">
                                  GMT (Greenwich Mean Time)
                                </option>
                                <option value="WAT">
                                  WAT (West Africa Time)
                                </option>
                                <option value="CAT">
                                  CAT (Central Africa Time)
                                </option>
                                <option value="CST">
                                  CST (China Standard Time)
                                </option>
                              </select>
                            </div>
                            <div>
                              <label
                                htmlFor="dateFormat"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Date Format
                              </label>
                              <select
                                id="dateFormat"
                                name="dateFormat"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                disabled={!isEditing}
                                defaultValue="MM/DD/YYYY"
                              >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-4">
                            Theme & Appearance
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center">
                              <input
                                id="lightTheme"
                                name="theme"
                                type="radio"
                                defaultChecked
                                disabled={!isEditing}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <label
                                htmlFor="lightTheme"
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                Light Theme
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="darkTheme"
                                name="theme"
                                type="radio"
                                disabled={!isEditing}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <label
                                htmlFor="darkTheme"
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                Dark Theme
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="systemTheme"
                                name="theme"
                                type="radio"
                                disabled={!isEditing}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <label
                                htmlFor="systemTheme"
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                System Theme (Auto)
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-4">
                            Notification Channels
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="emailNotifications"
                                  name="notifications.email"
                                  type="checkbox"
                                  checked={formData.notifications?.email}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="emailNotifications"
                                  className="font-medium text-gray-700"
                                >
                                  Email Notifications
                                </label>
                                <p className="text-gray-500">
                                  Receive transaction confirmations, security
                                  alerts, and account updates via email
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="smsNotifications"
                                  name="notifications.sms"
                                  type="checkbox"
                                  checked={formData.notifications?.sms}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="smsNotifications"
                                  className="font-medium text-gray-700"
                                >
                                  SMS Notifications
                                </label>
                                <p className="text-gray-500">
                                  Receive security codes and alerts to your
                                  registered phone number
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="pushNotifications"
                                  name="notifications.push"
                                  type="checkbox"
                                  checked={formData.notifications?.push}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="pushNotifications"
                                  className="font-medium text-gray-700"
                                >
                                  Push Notifications
                                </label>
                                <p className="text-gray-500">
                                  Receive instant alerts on your device
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="marketingEmails"
                                  name="notifications.marketingEmails"
                                  type="checkbox"
                                  checked={
                                    formData.notifications?.marketingEmails
                                  }
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="marketingEmails"
                                  className="font-medium text-gray-700"
                                >
                                  Marketing Emails
                                </label>
                                <p className="text-gray-500">
                                  Receive special offers and updates
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  {isEditing && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingChanges}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        {savingChanges ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
