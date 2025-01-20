import React, { useEffect, useState } from "react";
import {
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Users,
  UserCheck,
  AlertCircle,
  Home,
  X,
  LogOut,
  User,
  Mail,
} from "lucide-react";
import { ExecutionMethod } from "appwrite";
import { useAuth } from "./contexts/auth/authProvider";
import QuestionCreator from "./Management/QuestionCreator";
import _ from "lodash";
import LectureManagement from "./Management/LectureManagement";
import { useNavigate } from "react-router-dom";
import Exercise from "./Management/exercise";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-hot-toast";
import SpeakingListening from "./Management/Listening";
import GameManagement from "./Management/GameManagement";
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: boolean;
  registration: string;
  labels: string[];
  accessedAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
}

const AdminPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { functions, account } = useAuth();
  const [, setDebugInfo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });
  const functionId = "6746ea5c6eaf6e2b78ad";
  const availableRoles = [
    "Admin",
    "Teacher",
    "Student",
    "Instructor",
    "Parent",
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "",
    });
    setError(null);
  };
  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      toast.success("Đăng xuất thành công!", {
        icon: "👋",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      navigate("/");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
      console.error("Error during logout:", error);
    }
  };
  const closeUserModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.labels?.[0] || "", // Get the first label as the role
    });
    setIsModalOpen(true);
  };
  const formatPhoneNumber = (phone: string) => {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, "");
    // Remove leading 0 if exists
    const numberWithoutZero = cleaned.startsWith("0")
      ? cleaned.slice(1)
      : cleaned;
    // Always add +84 prefix
    return `+84${numberWithoutZero}`;
  };

  // Sửa lại phần validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Vui lòng nhập họ và tên");
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Email không hợp lệ");
      return false;
    }
    if (!formData.phone.match(/^\+?[0-9]{10,12}$/)) {
      setError("Số điện thoại không hợp lệ");
      return false;
    }
    if (!isEditMode && (!formData.password || formData.password.length < 8)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    // Thêm validate cho role
    if (!formData.role) {
      setError("Vui lòng chọn vai trò người dùng");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formatPhoneNumber(formData.phone),
      password: formData.password,
      labels: [formData.role], // Đảm bảo labels là array
    };

    try {
      if (isEditMode && selectedUser) {
        if (!selectedUser.id) {
          throw new Error("User ID is required for updating");
        }
        await updateUser(userData);
      } else {
        await addUser(userData);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  }; // Helper function to compare arrays

  const isEmailOrPhoneExist = (
    email: string,
    phone: string,
    userId?: string
  ) => {
    return allUsers.some(
      (user) =>
        (user.email === email && (!userId || user.id !== userId)) ||
        (user.phone === phone && (!userId || user.id !== userId))
    );
  };

  const addUser = async (userData: any) => {
    // Kiểm tra trùng email/phone
    if (isEmailOrPhoneExist(userData.email, userData.phone)) {
      setError("Email hoặc số điện thoại đã tồn tại.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Chuẩn bị payload đúng format
      const payload = {
        name: userData.name,
        email: userData.email,
        phone: formatPhoneNumber(userData.phone),
        password: userData.password,
        labels: userData.labels, // Đảm bảo đây là array
      };

      console.log("Sending payload:", payload);

      const response = await functions.createExecution(
        functionId,
        JSON.stringify(payload),
        false,
        "/add-users",
        ExecutionMethod.POST
      );

      if (!response?.responseBody) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      const result = JSON.parse(response.responseBody);

      if (result.status === "error") {
        throw new Error(result.message || "Không thể thêm người dùng");
      }

      // Nếu thành công
      await fetchUsers(); // Refresh danh sách người dùng
      closeUserModal();
    } catch (error: any) {
      console.error("Error adding user:", error);
      setError(error.message || "Không thể thêm người dùng");
    } finally {
      setIsLoading(false);
    }
  };
  // Update updateUser function with logging
  const updateUser = async (userData: any) => {
    if (
      selectedUser &&
      isEmailOrPhoneExist(userData.email, userData.phone, selectedUser.id)
    ) {
      setError("Email or phone number already exists.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugInfo("");
    closeUserModal();
    try {
      if (!selectedUser || !selectedUser.id) {
        throw new Error(
          "Không có người dùng nào được chọn để cập nhật hoặc ID người dùng không hợp lệ"
        );
      }

      const updateData: any = { userId: selectedUser.id };

      // Only include fields that have changed
      if (userData.email && selectedUser.email !== userData.email) {
        updateData.email = userData.email;
      }
      if (userData.name && selectedUser.name !== userData.name) {
        updateData.name = userData.name;
      }
      if (userData.password) {
        updateData.password = userData.password;
      }
      if (userData.phone && selectedUser.phone !== userData.phone) {
        updateData.phone = userData.phone;
      }
      if (userData.password && userData.password.trim() !== "") {
        updateData.password = userData.password;
      }
      if (
        userData.labels &&
        !arraysEqual(selectedUser.labels, userData.labels)
      ) {
        updateData.labels = userData.labels;
      }

      const response = await functions.createExecution(
        functionId,
        JSON.stringify(updateData),
        false,
        "/update-user",
        ExecutionMethod.PATCH,
        { "Content-Type": "application/json" }
      );

      if (response && response.responseBody) {
        const parsedBody = JSON.parse(response.responseBody);
        if (parsedBody.status === "success") {
          await fetchUsers();
          closeUserModal();
        } else {
          throw new Error(
            parsedBody.message || "Không thể cập nhật người dùng"
          );
        }
      } else {
        throw new Error("Không nhận được dữ liệu nào trong nội dung phản hồi");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      setError(`Failed to update user: ${error.message}`);
      setDebugInfo((prevInfo) => prevInfo + `\nUpdate error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const arraysEqual = (a: string[], b: string[]) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  // Hàm xử lý khi click nút xóa
  const handleDeleteClick = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await functions.createExecution(
        functionId,
        userId,
        false,
        "/delete-user",
        ExecutionMethod.DELETE
      );

      if (response && response.responseBody) {
        const result = JSON.parse(response.responseBody);
        if (result.status === "success") {
          await fetchUsers();
          setIsDeleteModalOpen(false);
          setUserIdToDelete(null);
        } else {
          throw new Error(result.message || "Không thể xóa người dùng");
        }
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.message || "Không thể xóa người dùng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  const getRoleStats = () => {
    return _.countBy(users, (user) => user.labels[0]); // Lấy role đầu tiên của mỗi user
  };
  const roleStats = getRoleStats();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await functions.createExecution(
        functionId,
        JSON.stringify({ limit: 1000000 }),
        false,
        "/list-users",
        ExecutionMethod.POST
      );

      console.log("Raw response:", response); // Log full response

      if (response?.responseBody) {
        const result = JSON.parse(response.responseBody);
        console.log("Parsed result:", result); // Log parsed result

        // Kiểm tra xem mỗi user có đủ trường không
        if (Array.isArray(result)) {
          const processedUsers = result.map((user) => ({
            ...user,
            labels: user.labels || [], // Đảm bảo labels luôn là array
          }));
          console.log("Processed users:", processedUsers);
          setUsers(processedUsers);
          setAllUsers(processedUsers);
        }
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.includes(searchQuery));
    const matchesRole = !roleFilter || user.labels.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản trị hệ thống
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý người dùng và tài liệu hệ thống
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/homepage")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Trang chủ
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quản lý người dùng
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "files"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quản lý tập tin
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "questions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quản lý câu hỏi
            </button>
            <button
              onClick={() => setActiveTab("lecture")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "lecture"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quản lý bài giảng
            </button>
            <button
              onClick={() => setActiveTab("speakinglistening")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "speakinglistening"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Luyện nghe
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "games"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quản lý trò chơi
            </button>
          </div>
        </div>

        {/* User Management Content */}
        {activeTab === "users" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    Tổng người dùng
                  </h3>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {users.length}
                </div>
                <p className="text-xs text-gray-600 mt-1">Đang hoạt động</p>
              </div>

              {availableRoles.slice(0, 3).map((role) => (
                <div
                  key={role}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-600">
                      {role}s
                    </h3>
                    <UserCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {roleStats[role] || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Người dùng</p>
                </div>
              ))}
            </div>

            {/* Main Content Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Header Actions */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Danh sách thành viên
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Quản lý và phân quyền người dùng trong hệ thống
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setIsEditMode(false);
                      resetForm();
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Thêm người dùng
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả vai trò</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setRoleFilter("");
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Làm mới
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Lỗi</h4>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Users Table */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="size-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-gray-600 text-sm font-medium text-center">
                      Đang tải dữ liệu...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead role="rowgroup">
                      <tr role="row" className="bg-gray-50">
                        <th
                          role="columnheader"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Họ và Tên
                        </th>
                        <th
                          role="columnheader"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          role="columnheader"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Số điện thoại
                        </th>
                        <th
                          role="columnheader"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ngày đăng ký
                        </th>
                        <th
                          role="columnheader"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Vai trò
                        </th>
                        <th
                          role="columnheader"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Chức năng
                        </th>
                      </tr>
                    </thead>
                    <tbody role="rowgroup" className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.phone}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatDate(user.registration)}
                          </td>
                          <td className="px-6 py-4">
                            {user.labels && user.labels.length > 0 ? (
                              user.labels.map((label) => (
                                <span
                                  key={label}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                                >
                                  {label}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        {/* File Management Content */}
        {activeTab === "files" && <Exercise />}
        {activeTab === "questions" && <QuestionCreator />}
        {activeTab === "lecture" && <LectureManagement />}
        {activeTab === "speakinglistening" && <SpeakingListening />}
        {activeTab === "games" && <GameManagement />}
        {/* User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              {/* Modal content */}
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {isEditMode
                    ? "Cập nhật thông tin người dùng"
                    : "Thêm người dùng mới"}
                </h2>
                <button
                  onClick={closeUserModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      Có lỗi xảy ra
                    </h4>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Form fields go here - match your existing form fields */}
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="size-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="size-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={"vn"}
                    value={formData.phone}
                    onChange={(phone) =>
                      setFormData({ ...formData, phone: `+${phone}` })
                    }
                    inputClass="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    containerClass="w-full"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEditMode
                      ? "Mật khẩu mới (để trống nếu không đổi)"
                      : "Mật khẩu"}
                  </label>
                  <input
                    type="password"
                    required={!isEditMode}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      isEditMode ? "Nhập mật khẩu mới" : "Nhập mật khẩu"
                    }
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isEditMode
                      ? "Chỉ điền nếu muốn thay đổi mật khẩu"
                      : "Mật khẩu phải có ít nhất 8 ký tự"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCheck className="size-5 text-gray-400" />
                    </div>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    >
                      <option value="">-- Chọn vai trò --</option>
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="size-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeUserModal}
                    className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin size-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>{isEditMode ? "Cập nhật" : "Thêm"}</>
                    )}
                  </button>
                </div>{" "}
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userIdToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Xác nhận xóa người dùng
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa người dùng này? Hành động này không
                  thể hoàn tác.
                </p>
                <div className="mt-4 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setUserIdToDelete(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => userIdToDelete && deleteUser(userIdToDelete)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Đang xóa...</span>
                      </div>
                    ) : (
                      "Xóa người dùng"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
