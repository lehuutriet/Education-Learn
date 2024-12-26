import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth/authProvider";
import { ID, Models, Query } from "appwrite";
import Papa from "papaparse";
import Navigation from "../Navigation/Navigation";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  X,
  Upload,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { Countdown } from "./Countdown"; // Create this component separately

// Thêm type definitions cho kết quả parse từ Papaparse
interface ParseResult {
  data: Array<Array<string>>;
  errors: Array<any>;
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  image?: string; // Add image support
}

interface Exam extends Models.Document {
  title: string;
  description: string;
  type: "multiple_choice" | "file_upload";
  questions?: Question[];
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
  answers?: { questionId: string; selectedOption: number }[];
  submittedAt: string;
  score?: number;
  feedback?: string;
}

const ExamManagement = ({ classroomId }: { classroomId: string }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [, setSelectedExam] = useState<Exam | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [, setCurrentUserId] = useState("");
  const [, setUserRole] = useState("");
  const [examType, setExamType] = useState<"multiple_choice" | "file_upload">(
    "multiple_choice"
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<{
    [key: string]: number;
  }>({});
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    startTime: "",
    endTime: "",
    maxScore: 10,
  });

  const { databases, storage, account } = useAuth();

  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const EXAMS_COLLECTION_ID = "6760f266000f252ae278";
  const BUCKET_ID = "67628e470015cec00d8b";

  // Thêm function handler cho file view và submissions
  const handleViewFile = async (fileId: string) => {
    try {
      const fileUrl = storage.getFileView(BUCKET_ID, fileId);
      window.open(fileUrl.toString(), "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
      setError("Không thể mở file");
    }
  };

  const handleViewSubmissions = (exam: Exam) => {
    setSelectedExam(exam);
    setIsViewModalOpen(true);
  };

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

  const fetchSubmissionCounts = async () => {
    try {
      const submissions = await databases.listDocuments(
        DATABASE_ID,
        "submissions_collection_id", // Replace with your actual collection ID
        [Query.equal("classroomId", [classroomId])]
      );

      const counts: { [key: string]: number } = {};
      (submissions.documents as ExamSubmission[]).forEach((sub) => {
        counts[sub.examId] = (counts[sub.examId] || 0) + 1;
      });
      setSubmissionCounts(counts);
    } catch (error) {
      console.error("Error fetching submission counts:", error);
    }
  };

  useEffect(() => {
    fetchSubmissionCounts();
  }, [exams]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.type === "application/json") {
        try {
          const text = await file.text();
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            const parsedQuestions = json.map((q, index) => ({
              id: index.toString(),
              text: q.question || "",
              options: q.options || [],
              correctAnswer: q.correctAnswer || 0,
            }));
            setQuestions(parsedQuestions);
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setError("Invalid JSON format");
        }
      } else if (file.type === "text/csv") {
        Papa.parse(file, {
          complete: (results: ParseResult) => {
            const parsedQuestions = results.data.map((row, index) => ({
              id: index.toString(),
              text: row[0],
              options: [row[1], row[2], row[3], row[4]],
              correctAnswer: parseInt(row[5]) || 0,
            }));
            setQuestions(parsedQuestions);
          },
          header: false,
          error: (error: Error) => {
            console.error("CSV parsing error:", error);
            setError("Không thể đọc file CSV");
          },
        });
      } else {
        setFiles(Array.from(e.target.files));
      }
    }
  };

  const handleQuestionImageUpload = async (
    questionIndex: number,
    file: File
  ) => {
    try {
      const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);

      const newQuestions = [...questions];
      newQuestions[questionIndex].image = uploaded.$id;
      setQuestions(newQuestions);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Không thể tải lên ảnh");
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const user = await account.get();

      let examData: any = {
        ...formData,
        type: examType,
        status: "draft",
        classroomId,
        createdBy: user.$id,
      };

      if (examType === "multiple_choice") {
        examData.questions = questions;
      } else {
        // Upload files for file upload type
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
        examData.attachments = fileIds;
      }

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
    if (examType === "multiple_choice" && questions.length === 0) {
      setError("Vui lòng thêm ít nhất một câu hỏi");
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
    setQuestions([]);
    setError(null);
  };

  // Component for Question Form
  const QuestionForm = () => (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Câu hỏi trắc nghiệm</h3>
        <button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json,.csv";
            input.onchange = (e) => handleFileChange(e as any);
            input.click();
          }}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
        >
          Import từ file
        </button>
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Câu hỏi {index + 1}</h4>
            <button
              onClick={() => {
                setQuestions(questions.filter((que) => que.id !== q.id));
              }}
              className="text-red-500 hover:bg-red-50 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={q.text}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].text = e.target.value;
                setQuestions(newQuestions);
              }}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập câu hỏi"
            />

            <div className="space-y-2">
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    checked={q.correctAnswer === optIndex}
                    onChange={() => {
                      const newQuestions = [...questions];
                      newQuestions[index].correctAnswer = optIndex;
                      setQuestions(newQuestions);
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].options[optIndex] = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`Đáp án ${optIndex + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">
                Ảnh minh họa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleQuestionImageUpload(index, file);
                  }
                }}
                className="mt-1"
              />
              {q.image && (
                <img
                  src={storage.getFileView(BUCKET_ID, q.image).toString()}
                  alt="Question illustration"
                  className="mt-2 max-h-40 object-contain"
                />
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => {
          setQuestions([
            ...questions,
            {
              id: Date.now().toString(),
              text: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
            },
          ]);
        }}
        className="w-full py-2 flex items-center justify-center gap-2 text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50"
      >
        <Plus className="w-4 h-4" />
        Thêm câu hỏi
      </button>
    </div>
  );

  const ExamCard = ({ exam }: { exam: Exam }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-lg text-gray-900">{exam.title}</h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              exam.type === "multiple_choice"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {exam.type === "multiple_choice" ? "Trắc nghiệm" : "Tự luận"}
          </span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
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
        <p className="text-sm text-gray-600">{exam.description}</p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            Bắt đầu: {format(new Date(exam.startTime), "dd/MM/yyyy HH:mm")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Thời gian: {exam.duration} phút</span>
        </div>
      </div>

      <div className="mt-4">
        <Countdown
          startTime={exam.startTime}
          endTime={exam.endTime}
          duration={exam.duration}
        />
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">
          Số bài nộp: {submissionCounts[exam.$id] || 0}
        </span>
      </div>

      <div className="pt-4 border-t flex justify-between items-center">
        <div className="flex gap-2">
          {exam.type === "file_upload" &&
            exam.attachments?.map((fileId, index) => (
              <button
                key={fileId}
                onClick={() => handleViewFile(fileId)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Xem file {index + 1}
              </button>
            ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleViewSubmissions(exam)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteExam(exam.$id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation button */}
      <button
        onClick={() => setIsConfirmationOpen(true)}
        className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Xác nhận
      </button>

      {/* Confirmation modal */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Xác nhận nộp bài?</h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmationOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Handle submission confirmation
                  setIsConfirmationOpen(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đề thi</h1>
          <p className="mt-2 text-gray-600">
            Tạo và quản lý các đề thi trong lớp học
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="w-full max-w-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tạo đề thi mới
          </button>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.$id} exam={exam} />
          ))}
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tạo đề thi mới</h2>
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

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateExam} className="space-y-6">
                {/* Chọn loại đề thi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại đề thi
                  </label>
                  <select
                    value={examType}
                    onChange={(e) =>
                      setExamType(
                        e.target.value as "multiple_choice" | "file_upload"
                      )
                    }
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="multiple_choice">Trắc nghiệm</option>
                    <option value="file_upload">Tự luận (nộp file)</option>
                  </select>
                </div>

                {/* Thông tin cơ bản */}
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
                    className="w-full p-2 border rounded-lg"
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
                    className="w-full p-2 border rounded-lg"
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
                      className="w-full p-2 border rounded-lg"
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
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Form trắc nghiệm hoặc upload file */}
                {examType === "multiple_choice" ? (
                  <QuestionForm />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tệp đính kèm
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              multiple
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOCX up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Đang tạo..." : "Tạo đề thi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;
