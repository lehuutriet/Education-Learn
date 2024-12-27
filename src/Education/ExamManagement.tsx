import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  AlertCircle,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { ID, Models, Query } from "appwrite";
import { useAuth } from "../contexts/auth/authProvider";
import { Countdown } from "./Countdown";
import Navigation from "../Navigation/Navigation";
import React from "react";

interface Question extends Models.Document {
  type: "select" | "translate";
  prompt: string;
  options?: string[];
  answer: string;
  category: string;
  createdBy: string;
  imageId?: string;
  bucketId?: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  type: "multiple_choice" | "file_upload";
  questions?: Question[];
  duration: number;
  startTime: string;
  endTime: string;

  maxScore: number;
}
interface Question extends Models.Document {
  prompt: string;
  options?: string[];
  answer: string;

  category: string;
  createdBy: string;
  imageId?: string;
  bucketId?: string;
}

interface FormData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  type: "multiple_choice" | "file_upload";
  duration: number;
  startTime: string;
  endTime: string;
  maxScore: number;
  prompt: string;
  answer: string;
  options: string[];
  imageFile?: File | undefined; // Thêm optional chaining
  imagePreview?: string | undefined; // Thêm optional chaining
  numberOfQuestions: number; // Thêm trường này
  currentQuestionIndex: number; // Thêm để theo dõi câu hỏi hiện tại
  questions: Question[]; // Mảng lưu các câu hỏi
}
interface ExamInterfaceProps {
  exam: Exam;
  onClose: () => void;
  onSubmit: (answers: string[]) => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({
  exam,
  onClose,
  onSubmit,
}) => {
  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p>Không có câu hỏi nào trong đề thi này</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-4"
        >
          Quay lại
        </button>
      </div>
    );
  }
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    Array(exam.questions?.length || 0).fill("")
  );
  const [timeLeft] = useState(exam.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(selectedAnswers);
      onClose();
    } catch (error) {
      console.error("Error submitting exam:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50">
      {/* Header */}
      <Navigation />
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <div className="flex gap-4 mt-1 text-sm text-gray-600">
              <span>{exam.subject}</span>
              <span>{exam.grade}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Countdown
              startTime={exam.startTime}
              endTime={exam.endTime}
              duration={exam.duration}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {exam.questions && (
            <>
              <div className="text-2xl mb-8">
                {exam.questions[currentQuestion].prompt}
              </div>

              <div className="space-y-4">
                {exam.questions[currentQuestion].options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newAnswers = [...selectedAnswers];
                      newAnswers[currentQuestion] = option;
                      setSelectedAnswers(newAnswers);
                    }}
                    className={`w-full p-4 text-left rounded-lg border-2 transition
                      ${
                        selectedAnswers[currentQuestion] === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 ${
                          selectedAnswers[currentQuestion] === option
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAnswers[currentQuestion] === option && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentQuestion((prev) =>
                    Math.min((exam.questions?.length || 1) - 1, prev + 1)
                  )
                }
                disabled={currentQuestion === (exam.questions?.length || 1) - 1}
                className="px-4 py-2 text-gray-600 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              {exam.questions?.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-medium
                    ${
                      selectedAnswers[idx]
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }
                    ${
                      currentQuestion === idx
                        ? "ring-2 ring-blue-500 ring-offset-2"
                        : ""
                    }
                  `}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <Countdown
                startTime={exam.startTime}
                endTime={exam.endTime}
                duration={exam.duration}
              />
            </div>
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Nộp bài
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Xác nhận nộp bài</h3>
            <p className="text-gray-600 mb-6">
              Bạn đã trả lời {selectedAnswers.filter(Boolean).length}/
              {exam.questions?.length} câu hỏi. Bạn có chắc chắn muốn nộp bài?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {isSubmitting ? "Đang nộp..." : "Xác nhận nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const { databases, account, storage } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    subject: "",
    grade: "",
    type: "multiple_choice" as const,
    duration: 60,
    startTime: "",
    endTime: "",
    maxScore: 10,
    prompt: "",
    answer: "",
    options: ["", "", "", ""],
    imageFile: undefined,
    imagePreview: undefined,
    numberOfQuestions: 1, // Thêm giá trị mặc định
    currentQuestionIndex: 0, // Thêm giá trị mặc định
    questions: [], // Thêm mảng rỗng cho questions
  });

  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const EXAMS_COLLECTION_ID = "676e1f7300177eef75be";
  const BUCKET_questionsImageforExam = "676e2b060006efae803e";
  const QUESTIONS_COLLECTION_ID = "676e2bbc000befb2f52d";

  // Thêm state quản lý preview ảnh
  const [optionPreviews, setOptionPreviews] = useState<string[]>([]);

  // Handler upload ảnh cho option
  const handleOptionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      const newPreviews = [...optionPreviews];
      newPreviews[index] = preview;
      setOptionPreviews(newPreviews);

      // Upload và lưu file
      // ...
    }
  };

  // Xóa ảnh option
  const removeOptionImage = (index: number) => {
    const newPreviews = [...optionPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews[index] = "";
    setOptionPreviews(newPreviews);
  };
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        EXAMS_COLLECTION_ID
      );

      // Fetch questions cho mỗi exam
      const examsWithQuestions = await Promise.all(
        response.documents.map(async (exam) => {
          const questionsResponse = await databases.listDocuments(
            DATABASE_ID,
            QUESTIONS_COLLECTION_ID,
            [Query.equal("examId", [exam.$id])]
          );
          return {
            id: exam.$id,
            title: exam.title,
            description: exam.description,
            subject: exam.subject,
            grade: exam.grade,
            type: exam.type,
            questions: questionsResponse.documents,
            duration: exam.duration,
            startTime: exam.startTime,
            endTime: exam.endTime,
            maxScore: exam.maxScore,
          } as Exam;
        })
      );

      setExams(examsWithQuestions);
    } catch (error) {
      console.error(error);
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.currentQuestionIndex < formData.numberOfQuestions - 1) {
      // Lưu câu hỏi hiện tại vào mảng
      const currentQuestion: Question = {
        type: "select",
        prompt: formData.prompt,
        options: formData.options,
        answer: formData.answer,
        category: formData.subject,
        createdBy: "", // Will be set when saving to database
        $id: ID.unique(),
        $collectionId: QUESTIONS_COLLECTION_ID,
        $databaseId: DATABASE_ID,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
      };

      const newQuestions = [...formData.questions];
      newQuestions[formData.currentQuestionIndex] = currentQuestion;

      // Reset form cho câu tiếp theo
      setFormData({
        ...formData,
        questions: newQuestions,
        currentQuestionIndex: formData.currentQuestionIndex + 1,
        prompt: "",
        options: ["", "", "", ""],
        answer: "",
        // Reset các trường liên quan đến câu hỏi
      });
      return;
    }
    try {
      setLoading(true);
      const user = await account.get();
      let imageId = null;
      let bucketId = null;
      if (formData.imageFile) {
        const uploadedFile = await storage.createFile(
          BUCKET_questionsImageforExam,
          ID.unique(),
          formData.imageFile
        );
        imageId = uploadedFile.$id;
        bucketId = BUCKET_questionsImageforExam;
      }

      // Tạo question document
      const questionData = {
        type: "select",
        prompt: formData.prompt,
        options: formData.options.filter((opt) => opt), // Lọc bỏ options rỗng
        answer: formData.answer,
        category: formData.subject, // Dùng subject làm category
        createdBy: user.$id, // Thêm ID người tạo
        imageId,
        bucketId,
      };

      // Tạo exam document
      const examData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        grade: formData.grade,
        type: formData.type,
        duration: formData.duration,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxScore: formData.maxScore,
      };

      // Lưu exam trước
      const exam = await databases.createDocument(
        DATABASE_ID,
        EXAMS_COLLECTION_ID,
        ID.unique(),
        examData
      );

      // Sau đó lưu question và liên kết với exam
      await databases.createDocument(
        DATABASE_ID,
        QUESTIONS_COLLECTION_ID,
        ID.unique(),
        {
          ...questionData,
          examId: exam.$id, // Liên kết question với exam
        }
      );

      setExams((prev) => [...prev, exam as unknown as Exam]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      setError(error.message || "Không thể tạo đề thi");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subject: "",
      grade: "",
      type: "multiple_choice",
      duration: 60,
      startTime: "",
      endTime: "",
      maxScore: 10,
      prompt: "",
      answer: "",
      options: ["", "", "", ""],
      imageFile: undefined,
      imagePreview: undefined,
      numberOfQuestions: 1,
      currentQuestionIndex: 0,
      questions: [],
    });
    setError(null);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;

    try {
      await databases.deleteDocument(DATABASE_ID, EXAMS_COLLECTION_ID, examId);
      setExams((prev) => prev.filter((exam) => exam.id !== examId));
    } catch (error) {
      console.error("Error deleting exam:", error);
      setError("Không thể xóa đề thi");
    }
  };

  const startExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsExamMode(true);
  };

  const handleExamSubmit = async (answers: string[]) => {
    // Handle exam submission logic here
    console.log("Submitted answers:", answers);
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isExamMode && selectedExam) {
    return (
      <ExamInterface
        exam={selectedExam}
        onClose={() => setIsExamMode(false)}
        onSubmit={handleExamSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navigation />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đề thi</h1>
        <p className="text-gray-600 mt-2">
          Tạo và quản lý các đề thi trong hệ thống
        </p>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Tạo đề thi mới
            </button>
          </div>
        </div>

        {/* Exams List */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có đề thi nào
              </h3>
              <p className="text-gray-500">
                Bắt đầu bằng cách tạo đề thi đầu tiên
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-lg shadow overflow-hidden border"
                >
                  <div className="p-6">
                    <h3 className="font-medium text-lg mb-2">{exam.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-4 text-sm px-2 py-1 rounded-full bg-green-100">
                        {exam.subject}
                      </span>
                      <span className="mr-4 text-sm px-2 py-1 rounded-full bg-blue-100">
                        {exam.grade}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {exam.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{exam.duration} phút</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startExam(exam)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Làm bài
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tạo đề thi</h2>
              <h2 className="text-2xl font-bold">
                Câu hỏi {formData.currentQuestionIndex + 1}/
                {formData.numberOfQuestions}
              </h2>
              <button
                onClick={handleCloseModal}
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

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="p-6 space-y-8">
                {/* Thông tin cơ bản */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại câu hỏi
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as
                              | "multiple_choice"
                              | "file_upload",
                          })
                        }
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="multiple_choice">Trắc nghiệm</option>
                        <option value="file_upload">Dịch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu đề
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số câu hỏi
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.numberOfQuestions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numberOfQuestions: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Câu hỏi
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={formData.prompt}
                        onChange={(e) =>
                          setFormData({ ...formData, prompt: e.target.value })
                        }
                        className="flex-1 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Thêm ảnh
                      </button>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </div>
                    {formData.imagePreview && (
                      <div className="mt-4 relative inline-block">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="h-32 w-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(formData.imagePreview!);
                            setFormData({
                              ...formData,
                              imageFile: undefined,
                              imagePreview: undefined,
                            });
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thời gian */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Cài đặt thời gian
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian làm bài (phút)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Phần đáp án */}
                {formData.type === "multiple_choice" && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">
                      Đáp án
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {formData.options.map((option, index) => (
                        <div
                          key={index}
                          onClick={() =>
                            setFormData({ ...formData, answer: option })
                          }
                          className={`p-4 rounded-lg transition-all ${
                            formData.answer === option
                              ? "bg-blue-50 border-2 border-blue-500"
                              : "bg-white border border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                formData.answer === option
                                  ? "border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {formData.answer === option && (
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              Đáp án {index + 1}
                            </span>
                          </div>

                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[index] = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập nội dung đáp án..."
                          />

                          {optionPreviews[index] ? (
                            <div className="mt-4 relative">
                              <img
                                src={optionPreviews[index]}
                                className="w-full h-32 object-cover rounded-lg"
                                alt={`Option ${index + 1}`}
                              />
                              <button
                                onClick={() => removeOptionImage(index)}
                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg"
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById(`option-image-${index}`)
                                  ?.click()
                              }
                              className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Thêm ảnh cho đáp án
                            </button>
                          )}
                          <input
                            id={`option-image-${index}`}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleOptionImageUpload(e, index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : formData.currentQuestionIndex <
                    formData.numberOfQuestions - 1 ? (
                    "Câu hỏi tiếp theo"
                  ) : (
                    "Tạo đề thi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
