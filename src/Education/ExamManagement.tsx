import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth/authProvider";
import { ID, Models, Query } from "appwrite";
import Navigation from "../Navigation/Navigation";
import {
  Plus,
  Search,
  FileText,
  Calendar,
  Clock,
  Download,
  Trash2,
  AlertCircle,
  Users,
  X,
  Upload,
  Eye,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Exam extends Models.Document {
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  status: "draft" | "published" | "completed";
  attachments: string[];
  classroomId: string;
  createdBy: string;
  maxScore: number;
}

interface ExamSubmission extends Models.Document {
  examId: string;
  userId: string;
  userName: string;
  files: string[];
  submittedAt: string;
  score?: number;
  feedback?: string;
}

const ExamManagement = ({ classroomId }: { classroomId: string }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [, setCurrentUserId] = useState("");
  const [userRole, setUserRole] = useState("");

  const { databases, storage, account } = useAuth();

  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const EXAMS_COLLECTION_ID = "6760f266000f252ae278";
  const SUBMISSIONS_EXAM_COLLECTION_ID = "67628d9e0002ef805b72";
  const BUCKET_ID = "67628e470015cec00d8b";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    startTime: "",
    endTime: "",
    maxScore: 10,
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
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        EXAMS_COLLECTION_ID,
        [Query.equal("classroomId", [classroomId])]
      );
      setExams(response.documents as Exam[]);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setError("Không thể tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const user = await account.get();

      // Upload files
      const fileIds = await Promise.all(
        files.map(async (file) => {
          const uploaded = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
          );
          return uploaded.$id;
        })
      );

      const examData = {
        ...formData,
        status: "draft",
        attachments: fileIds,
        classroomId,
        createdBy: user.$id,
      };

      await databases.createDocument(
        DATABASE_ID,
        EXAMS_COLLECTION_ID,
        ID.unique(),
        examData
      );

      await fetchExams();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating exam:", error);
      setError("Không thể tạo đề thi");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      const fileUrl = storage.getFileDownload(BUCKET_ID, fileId);
      window.open(fileUrl.toString(), "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Không thể tải file");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;

    try {
      setLoading(true);
      await databases.deleteDocument(DATABASE_ID, EXAMS_COLLECTION_ID, examId);
      await fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      setError("Không thể xóa đề thi");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: 60,
      startTime: "",
      endTime: "",
      maxScore: 10,
    });
    setFiles([]);
    setError(null);
  };

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isTeacherOrAdmin = () => ["Teacher", "Admin"].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Navigation />
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm đề thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {isTeacherOrAdmin() && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo đề thi mới
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <div
            key={exam.$id}
            className="bg-white rounded-lg shadow-sm border p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-lg text-gray-900">
                {exam.title}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium 
                ${
                  exam.status === "published"
                    ? "bg-green-100 text-green-800"
                    : exam.status === "completed"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {exam.status === "published"
                  ? "Đã công bố"
                  : exam.status === "completed"
                  ? "Đã kết thúc"
                  : "Bản nháp"}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Bắt đầu:{" "}
                  {format(new Date(exam.startTime), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Thời gian: {exam.duration} phút</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                {exam.attachments?.map((fileId, index) => (
                  <button
                    key={fileId}
                    onClick={() => handleDownloadFile(fileId)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    File {index + 1}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {isTeacherOrAdmin() && (
                  <>
                    <button
                      onClick={() => handleDeleteExam(exam.$id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedExam(exam);
                        setIsViewModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Exam Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Tạo đề thi mới</h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian làm bài (phút)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm tối đa
                  </label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxScore: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tài liệu đính kèm
                </label>
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <Upload className="w-4 h-4 mr-2 inline-block" />
                    Chọn file
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-500">
                    {files.length} file đã chọn
                  </span>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang tạo..." : "Tạo đề thi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Submissions Modal */}
      {isViewModalOpen && selectedExam && (
        <ExamSubmissionsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedExam(null);
          }}
          exam={selectedExam}
        />
      )}

      {/* No Exams Message */}
      {!loading && filteredExams.length === 0 && (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Chưa có đề thi nào
          </h3>
          <p className="mt-1 text-gray-500">
            Hãy tạo đề thi đầu tiên cho lớp học của bạn.
          </p>
        </div>
      )}
    </div>
  );
};

// Exam Submissions Modal Component
interface ExamSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
}

const ExamSubmissionsModal = ({
  isOpen,
  onClose,
  exam,
}: ExamSubmissionsModalProps) => {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { databases, storage } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        SUBMISSIONS_EXAM_COLLECTION_ID,
        [Query.equal("examId", [exam.$id])]
      );
      setSubmissions(response.documents as ExamSubmission[]);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("Không thể tải danh sách bài nộp");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = async (fileId: string) => {
    try {
      const fileUrl = storage.getFileView(BUCKET_ID, fileId);
      window.open(fileUrl.toString(), "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
      setError("Không thể mở file");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Bài nộp</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Chưa có bài nộp
            </h3>
            <p className="mt-1 text-gray-500">
              Hiện chưa có học sinh nào nộp bài thi này.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {submissions.map((submission) => (
              <div key={submission.$id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {submission.userName}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      Nộp lúc:{" "}
                      {format(
                        new Date(submission.submittedAt),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </div>
                  </div>
                  {submission.score !== undefined && (
                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {submission.score} điểm
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {submission.files?.map((fileId, index) => (
                    <button
                      key={fileId}
                      onClick={() => handleViewFile(fileId)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="w-4 h-4" />
                      File {index + 1}
                    </button>
                  ))}
                </div>

                {submission.feedback && (
                  <div className="mt-4 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Nhận xét của giáo viên:
                    </div>
                    <p className="text-sm text-gray-600">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {submission.score !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      Đã chấm điểm
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;
