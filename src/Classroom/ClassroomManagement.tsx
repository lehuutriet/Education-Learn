import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  Users,
  School,
  UserCheck,
  Eye,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useAuth } from "../contexts/auth/authProvider";
import Navigation from "../Navigation/Navigation";
import { ID } from "appwrite";
interface Classroom {
  $id: string;
  className: string;
  academicYear: string;
  studentCount: number;
  teacher: string;
  createdAt: string;
  status: "active" | "inactive";
  participants: string[]; // Array of user IDs
  createdBy: string;
}

const ClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { databases, account } = useAuth();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null
  );
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<string | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  // Handle view details
  const handleViewDetails = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setShowDetailsModal(true);
  };
  const [formData, setFormData] = useState({
    className: "",
    academicYear: "",
    studentCount: 0,
    teacher: "",
  });
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
        setUserRole(user.labels?.[0] || "");
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    getCurrentUser();
  }, [account]);
  // Database and collection IDs
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const COLLECTION_ID = "675019710029634eb602";
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID
      );
      setClassrooms(response.documents as unknown as Classroom[]);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      setError("Failed to fetch classrooms");
    }
  };
  const isStaffMember = () => {
    return ["Admin", "Teacher"].includes(userRole);
  };
  const handleDeleteClassroom = async (classroomId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, classroomId);

      // Refresh classrooms list
      await fetchClassrooms();
      setShowDeleteConfirmation(false);
      setClassroomToDelete(null);
    } catch (error) {
      console.error("Error deleting classroom:", error);
      setError("Failed to delete classroom");
    }
  };

  // Function to initiate classroom deletion
  const initiateDelete = (classroomId: string) => {
    setClassroomToDelete(classroomId);
    setShowDeleteConfirmation(true);
  };
  // Simplified function to get student count
  const getStudentCount = (participants: string[], createdBy: string) => {
    // Only count participants that aren't the creator
    return participants?.filter((id) => id !== createdBy).length || 0;
  };
  const handleCreateClass = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await account.get();

      const newClassroom = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: "active",
        participants: [user.$id],
        createdBy: user.$id,
      };

      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        newClassroom
      );

      await fetchClassrooms();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating classroom:", error);
      setError("Failed to create classroom");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClass = async (classroomId: string) => {
    try {
      const user = await account.get();
      const classroom = classrooms.find((c) => c.$id === classroomId);

      if (!classroom) {
        throw new Error("Classroom not found");
      }

      if (classroom.participants.includes(user.$id)) {
        setError("Bạn đã tham gia lớp học này rồi");
        return;
      }

      // Only count non-creator participants for the student count
      const currentStudentCount = getStudentCount(
        classroom.participants,
        classroom.createdBy
      );
      if (currentStudentCount >= classroom.studentCount) {
        setError("Lớp học đã đủ sĩ số");
        return;
      }

      const updatedParticipants = [...classroom.participants, user.$id];

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        classroom.$id,
        {
          participants: updatedParticipants,
        }
      );

      await fetchClassrooms();
    } catch (error) {
      console.error("Error joining classroom:", error);
      setError("Không thể tham gia lớp học");
    }
  };

  const validateForm = () => {
    if (
      !formData.className ||
      !formData.teacher ||
      !formData.academicYear ||
      formData.studentCount < 1
    ) {
      setError("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      className: "",
      academicYear: "",
      studentCount: 0,
      teacher: "",
    });
    setError(null);
  };

  const handleNavigateToClassroom = (classId: string) => {
    navigate(`/classroom/${classId}`);
  };

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classroom.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Thêm div container mới cho content với padding */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp học</h1>
          <p className="text-gray-600 mt-2">
            Tạo và quản lý các lớp học trong hệ thống
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng số lớp
              </CardTitle>
              <School className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <div className="text-2xl font-bold">{classrooms.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng số học sinh
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <div className="text-2xl font-bold">
                {classrooms.reduce(
                  (sum, classroom) =>
                    sum +
                    getStudentCount(
                      classroom.participants,
                      classroom.createdBy
                    ),
                  0
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Lớp đang hoạt động
              </CardTitle>
              <UserCheck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <div className="text-2xl font-bold">
                {classrooms.filter((c) => c.status === "active").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm lớp học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            </div>

            {isStaffMember() && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Tạo lớp mới
              </button>
            )}
          </div>
        </div>

        {/* Classrooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <Card
              key={classroom.$id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">
                    {classroom.className}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Năm học {classroom.academicYear}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Giáo Viên: {classroom.teacher}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classroom.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {classroom.status === "active"
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </span>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {getStudentCount(
                          classroom.participants,
                          classroom.createdBy
                        )}
                        /{classroom.studentCount} học sinh
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(classroom)}
                      className="flex-1 py-2 text-center border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                    {isStaffMember() ? (
                      <div className="flex gap-2 flex-1">
                        <button
                          onClick={() =>
                            handleNavigateToClassroom(classroom.$id)
                          }
                          className="flex-1 py-2 text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Vào lớp học
                        </button>
                        <button
                          onClick={() => initiateDelete(classroom.$id)}
                          className="px-3 py-2 text-center bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {classroom.participants?.includes(currentUserId) ? (
                          <button
                            onClick={() =>
                              handleNavigateToClassroom(classroom.$id)
                            }
                            className="flex-1 py-2 text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Vào lớp học
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinClass(classroom.$id)}
                            className="flex-1 py-2 text-center bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Tham gia
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Xác nhận xóa lớp học
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Bạn có chắc chắn muốn xóa lớp học này? Hành động này không
                    thể hoàn tác.
                  </p>
                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowDeleteConfirmation(false);
                        setClassroomToDelete(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() =>
                        classroomToDelete &&
                        handleDeleteClassroom(classroomToDelete)
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      Xóa lớp học
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedClassroom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Chi tiết lớp học</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedClassroom.className}
                  </h3>
                  <p className="text-gray-600">
                    Năm học: {selectedClassroom.academicYear}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Giáo viên chủ nhiệm</p>
                    <p className="font-medium">{selectedClassroom.teacher}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sĩ số</p>
                    <p className="font-medium">
                      {getStudentCount(
                        selectedClassroom.participants,
                        selectedClassroom.createdBy
                      )}
                      /{selectedClassroom.studentCount} học sinh
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p
                      className={`font-medium ${
                        selectedClassroom.status === "active"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {selectedClassroom.status === "active"
                        ? "Đang hoạt động"
                        : "Không hoạt động"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-medium">
                      {new Date(
                        selectedClassroom.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Đóng
                  </button>
                  {selectedClassroom.participants?.includes(currentUserId) ? (
                    <button
                      onClick={() => {
                        handleNavigateToClassroom(selectedClassroom.$id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Vào lớp học
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleJoinClass(selectedClassroom.$id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Tham gia lớp học
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Create Classroom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Tạo lớp học mới</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateClass();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên lớp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 12A1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYear: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 2023-2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sĩ số <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.studentCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentCount: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giáo viên chủ nhiệm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.teacher}
                  onChange={(e) =>
                    setFormData({ ...formData, teacher: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên giáo viên"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Đang xử lý..." : "Tạo lớp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomManagement;
