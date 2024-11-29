import React, { useEffect, useState } from "react";
import { Search, Edit2, Trash2, UserPlus } from "lucide-react";
import { ExecutionMethod } from "appwrite";
import { useAuth } from "./contexts/auth/authProvider";
import { notifications } from "@mantine/notifications";

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
  const { functions } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });
  const functionId = "6746ea5c6eaf6e2b78ad";
  const availableRoles = [
    "Giáo viên",
    "Học sinh",
    "Người hướng dẫn",
    "Phụ huynh",
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
      role: user.labels[0] || "",
    });
    setIsModalOpen(true);
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, "");
    // Format as Vietnamese phone number
    if (cleaned.length >= 10) {
      return `+84${cleaned.slice(-9)}`;
    }
    return cleaned;
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
      ...formData,
      phone: formatPhoneNumber(formData.phone),
      labels: [formData.role],
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
    setIsLoading(true);
    setError(null);

    try {
      if (!userData.password) {
        throw new Error("Password is required for new users");
      }

      // Log để debug
      console.log("Form data before sending:", userData);

      const dataToSend = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: formatPhoneNumber(userData.phone),
        role: userData.role,
        labels: [userData.role], // Đảm bảo role được thêm vào labels
      };

      // Log data gửi đi
      console.log("Data sending to server:", dataToSend);

      const response = await functions.createExecution(
        functionId,
        JSON.stringify(dataToSend),
        false,
        "/add-users",
        ExecutionMethod.POST
      );

      // Log response
      console.log("Server response:", response);

      const result = JSON.parse(response?.responseBody || "{}");

      if (result.status === "success") {
        notifications.show({
          title: "Thành công",
          message: `Đã thêm người dùng ${userData.name} với vai trò ${userData.role}`,
          color: "green",
        });
        await fetchUsers();
        closeUserModal();
      } else {
        throw new Error(result?.message || "Không thể thêm người dùng");
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      setError(error.message || "Không thể thêm người dùng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      if (!selectedUser || !selectedUser.id) {
        throw new Error(
          "Không có người dùng nào được chọn để cập nhật hoặc ID người dùng không hợp lệ"
        );
      }

      const updateData: any = {
        userId: selectedUser.id,
        // Always include role/labels in update data
        labels: [userData.role || userData.labels[0]],
      };

      // Add other changed fields
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

      const response = await functions.createExecution(
        functionId,
        JSON.stringify(updateData),
        false,
        "/update-user",
        ExecutionMethod.PATCH,
        { "Content-Type": "application/json" }
      );

      const result = JSON.parse(response?.responseBody || "{}");

      if (result.status === "success") {
        await fetchUsers(); // Refresh user list immediately
        notifications.show({
          title: "Thành công",
          message: "Thông tin người dùng đã được cập nhật",
          color: "green",
        });
        closeUserModal();
      } else {
        throw new Error(result.message || "Không thể cập nhật người dùng");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      notifications.show({
        title: "Lỗi",
        message:
          error.message ||
          "Không thể cập nhật thông tin người dùng. Vui lòng thử lại.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

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
          notifications.show({
            title: "Thành công",
            message: "Người dùng đã được xóa thành công",
            color: "green",
          });
        } else {
          throw new Error(result.message || "Không thể xóa người dùng");
        }
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.message || "Không thể xóa người dùng. Vui lòng thử lại.");
      notifications.show({
        title: "Lỗi",
        message: "Không thể xóa người dùng. Vui lòng thử lại.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      if (response?.responseBody) {
        const result = JSON.parse(response.responseBody);
        if (Array.isArray(result)) {
          setUsers(result);
          setAllUsers(result); // Update allUsers state as well
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải danh sách người dùng",
        color: "red",
      });
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
  useEffect(() => {
    console.log("Current form data:", formData);
  }, [formData]);
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Danh sách thành viên</h1>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditMode(false);
              resetForm();
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <UserPlus className="size-4" />
            Thêm người dùng
          </button>
        </div>

        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 size-5" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-md p-2"
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
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-4">Đang tải...</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Họ và Tên</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Số điện thoại</th>
                <th className="border p-2 text-left">Ngày đăng ký</th>
                <th className="border p-2 text-left">Vai trò</th>
                <th className="border p-2 text-center">Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.phone}</td>
                  <td className="border p-2">
                    {formatDate(user.registration)}
                  </td>
                  <td className="border p-2">
                    {user.labels.join(", ") || "Chưa phân quyền"}
                  </td>
                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-orange-500 hover:text-orange-600"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode
                ? "Cập nhật thông tin người dùng"
                : "Thêm người dùng mới"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {!isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mật khẩu"
                    minLength={8}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    console.log("Selected role:", newRole); // Debug
                    setFormData((prev) => ({
                      ...prev,
                      role: newRole,
                    }));
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Chọn vai trò --</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeUserModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Đang xử lý..."
                    : isEditMode
                    ? "Cập nhật"
                    : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
