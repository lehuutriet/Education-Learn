import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Save, X, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/auth/authProvider";
import { ID } from "appwrite";
import { toast } from "react-hot-toast";

// Interface cho từng loại game
interface WordGameData {
  $id: string;
  words: string[];
  correctAnswer: string;
  level: number;
}

interface MemoryGameData {
  $id: string;
  equation: string;
  answer: string;
  level: number;
}

interface QuizGameData {
  $id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  level: number;
  category: string;
}

const GameManagement = () => {
  const { databases } = useAuth();
  const [gameType, setGameType] = useState<"word" | "memory" | "quiz">("word");

  // State riêng cho từng loại game
  const [wordGames, setWordGames] = useState<WordGameData[]>([]);
  const [memoryGames, setMemoryGames] = useState<MemoryGameData[]>([]);
  const [quizGames, setQuizGames] = useState<QuizGameData[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  // Form state
  const [formData, setFormData] = useState<any>({
    level: 1,
    words: Array(4).fill(""), // Mặc định 4 từ cho cấp độ cơ bản
    correctAnswer: "",
    firstNumber: "",
    operators: Array(3).fill("+"), // mảng chứa các phép tính (+, -, ×, ÷)
    numbers: [], // mảng chứa các số tiếp theo
    question: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    equation: "",
    answer: "",
    category: "",

    operator: "+",
    secondNumber: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Database config
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const COLLECTIONS = {
    word: "6789dfaa000bb6b7ace9",
    memory: "6789dfb10025bb05631a",
    quiz: "6789dfb80024b84acbb4",
  };

  useEffect(() => {
    fetchGameData();
  }, [gameType]);

  // Thêm hàm xử lý khi thay đổi level trong form word game
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = Number(e.target.value);
    const wordCount = level === 1 ? 4 : level === 2 ? 8 : 12;

    setFormData({
      ...formData,
      level: level,
      words: Array(wordCount).fill(""), // Tạo mảng mới với số từ tương ứng
    });
  };
  // Fetch data theo loại game
  const fetchGameData = async () => {
    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS[gameType]
      );

      switch (gameType) {
        case "word":
          const wordData = response.documents.map((doc) => ({
            $id: doc.$id,
            words: doc.words,
            correctAnswer: doc.correctAnswer,
            level: doc.level,
          }));
          setWordGames(wordData);
          break;

        case "memory":
          const memoryData = response.documents.map((doc) => ({
            $id: doc.$id,
            equation: doc.equation,
            answer: doc.answer,
            level: doc.level,
          }));
          setMemoryGames(memoryData);
          break;

        case "quiz":
          const quizData = response.documents.map((doc) => ({
            $id: doc.$id,
            question: doc.question,
            options: doc.options,
            correctAnswer: doc.correctAnswer,
            category: doc.category,
            level: doc.level,
          }));
          setQuizGames(quizData);
          break;
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      level: 1,
      words: Array(4).fill(""),
      correctAnswer: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      equation: "",
      answer: "",
      category: "",
      firstNumber: "",
      operator: "+",
      secondNumber: "",
      operators: Array(3).fill("+"), // Khởi tạo mảng operators
      numbers: Array(3).fill(""), // Khởi tạo mảng numbers
    });
    setEditingId(null);
    setError("");
  };

  // Form validation
  const validateForm = () => {
    if (gameType === "word") {
      if (formData.words.some((w: string) => !w.trim())) {
        setError("Vui lòng điền đầy đủ các từ");
        return false;
      }
      if (!formData.correctAnswer) {
        setError("Vui lòng nhập đáp án đúng");
        return false;
      }
    }

    if (gameType === "memory") {
      if (
        !formData.firstNumber ||
        !formData.operators ||
        formData.operators.length === 0 ||
        formData.numbers?.length === 0
      ) {
        setError("Vui lòng điền đầy đủ phép tính");
        return false;
      }
    }
    if (gameType === "quiz") {
      if (!formData.question) {
        setError("Vui lòng nhập câu hỏi");
        return false;
      }
      if (formData.options.some((opt: string) => !opt.trim())) {
        setError("Vui lòng điền đầy đủ các phương án");
        return false;
      }
    }

    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let data;
      if (gameType === "memory") {
        data = {
          equation: `${formData.firstNumber} ${formData.operator} ${formData.secondNumber}`,
          answer: formData.answer,
          level: Number(formData.level),
        };
      }
      switch (gameType) {
        // Trong switch case memory của hàm handleSubmit
        case "memory": {
          let equation = formData.firstNumber;
          for (let i = 0; i < formData.operators.length; i++) {
            if (formData.numbers[i]) {
              let operator = formData.operators[i];
              // Convert dấu về dạng lưu DB
              if (operator === "×") operator = "*";
              if (operator === "÷") operator = "/";
              equation += ` ${operator} ${formData.numbers[i]}`;
            }
          }

          data = {
            equation: equation,
            answer: formData.answer,
            level: Number(formData.level),
          };
          break;
        }

        case "word": {
          const formattedAnswer = formData.correctAnswer
            .split(/\s+/)
            .join(" ")
            .trim();
          data = {
            words: formData.words,
            correctAnswer: formattedAnswer,
            level: Number(formData.level),
          };
          break;
        }

        case "quiz": {
          data = {
            question: formData.question,
            options: formData.options,
            correctAnswer: formData.correctAnswerIndex,
            category: formData.category,
            level: Number(formData.level),
          };
          break;
        }
      }
      if (editingId) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS[gameType],
          editingId,
          data
        );
        toast.success("Cập nhật thành công!");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS[gameType],
          ID.unique(),
          data
        );
        toast.success("Thêm mới thành công!");
      }

      setShowModal(false);
      resetForm();
      fetchGameData();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
      console.log(error);
    }
  };
  // Delete game data
  const handleDelete = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS[gameType],
        idToDelete
      );
      toast.success("Xóa thành công!");
      fetchGameData();
    } catch (error) {
      toast.error("Lỗi khi xóa");
    } finally {
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
    }
  };

  // Edit game data
  const handleEdit = (data: WordGameData | MemoryGameData | QuizGameData) => {
    if (gameType === "memory") {
      const parts = (data as MemoryGameData).equation.split(" ");
      const numbers = [];
      const operators = parts
        .filter((_, i) => i % 2 === 1) // Lấy các phần tử ở vị trí lẻ (operators)
        .map((op) => {
          // Convert dấu cho đúng format
          if (op === "*") return "×";
          if (op === "/") return "÷";
          return op;
        });

      const numbersArr = parts.filter((_, i) => i % 2 === 0); // Lấy các số
      const firstNumber = numbersArr[0];
      numbers.push(...numbersArr.slice(1));

      setFormData({
        ...data,
        firstNumber,
        operators,
        numbers,
        level: (data as MemoryGameData).level,
      });
    } else if (gameType === "quiz") {
      // Thêm correctAnswerIndex từ data
      setFormData({
        ...data,
        correctAnswerIndex: (data as QuizGameData).correctAnswer, // Thêm dòng này
        level: (data as QuizGameData).level,
      });
    } else {
      setFormData(data);
    }
    setEditingId(data.$id);
    setShowModal(true);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý trò chơi
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý dữ liệu cho các trò chơi học tập
        </p>

        {/* Game type tabs */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setGameType("word")}
            className={`px-4 py-2 rounded-lg ${
              gameType === "word"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ghép từ
          </button>
          <button
            onClick={() => setGameType("memory")}
            className={`px-4 py-2 rounded-lg ${
              gameType === "memory"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Trí nhớ số học
          </button>
          <button
            onClick={() => setGameType("quiz")}
            className={`px-4 py-2 rounded-lg ${
              gameType === "quiz"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Câu đố
          </button>
        </div>

        {/* Add button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>

        {/* Data tables */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="mt-6">
            {/* Word game table */}
            {gameType === "word" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Các từ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Đáp án
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cấp độ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wordGames.map((game) => (
                    <tr key={game.$id}>
                      <td className="px-6 py-4">{game.words.join(", ")}</td>
                      <td className="px-6 py-4">{game.correctAnswer}</td>
                      <td className="px-6 py-4">
                        {game.level === 1
                          ? "Cơ bản"
                          : game.level === 2
                          ? "Trung bình"
                          : "Nâng cao"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(game)}
                          className="text-blue-600 hover:text-blue-800 mx-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(game.$id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Memory game table */}
            {gameType === "memory" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phép tính
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kết quả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cấp độ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memoryGames.map((game) => (
                    <tr key={game.$id}>
                      <td className="px-6 py-4">
                        {game.equation?.replace(/undefined/g, "") ||
                          "Không có dữ liệu"}
                      </td>
                      <td className="px-6 py-4">{game.answer}</td>
                      <td className="px-6 py-4">
                        {game.level === 1
                          ? "Cơ bản"
                          : game.level === 2
                          ? "Trung bình"
                          : "Nâng cao"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(game)}
                          className="text-blue-600 hover:text-blue-800 mx-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(game.$id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Quiz game table */}
            {gameType === "quiz" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Câu hỏi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phân loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cấp độ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizGames.map((game) => (
                    <tr key={game.$id}>
                      <td className="px-6 py-4">{game.question}</td>
                      <td className="px-6 py-4">{game.category}</td>
                      <td className="px-6 py-4">
                        {game.level === 1
                          ? "Cơ bản"
                          : game.level === 2
                          ? "Trung bình"
                          : "Nâng cao"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(game)}
                          className="text-blue-600 hover:text-blue-800 mx-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(game.$id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal form thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editingId ? "Chỉnh sửa" : "Thêm mới"}{" "}
                {gameType === "word"
                  ? "Ghép từ"
                  : gameType === "memory"
                  ? "Trí nhớ số học"
                  : "Câu đố"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Cấp độ chung cho tất cả game */}

              {/* Form ghép từ */}
              {gameType === "word" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cấp độ
                    </label>
                    <select
                      value={formData.level}
                      onChange={handleLevelChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Cơ bản</option>
                      <option value={2}>Trung bình</option>
                      <option value={3}>Nâng cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Các từ ghép
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.words.map((word: string, index: number) => (
                        <input
                          key={index}
                          type="text"
                          value={word}
                          onChange={(e) => {
                            const newWords = [...formData.words];
                            newWords[index] = e.target.value;
                            setFormData({ ...formData, words: newWords });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`Từ ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>{" "}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đáp án đúng
                    </label>
                    <input
                      type="text"
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập câu đúng khi ghép các từ"
                    />
                  </div>
                </>
              )}

              {/* Form trí nhớ số học */}
              {gameType === "memory" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cấp độ
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Cơ bản (1 phép tính)</option>
                      <option value={2}>Trung bình (2 phép tính)</option>
                      <option value={3}>Nâng cao (3 phép tính trở lên)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xây dựng phép tính
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {/* Số đầu tiên */}
                      <input
                        type="number"
                        value={formData.firstNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstNumber: e.target.value,
                          })
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Số"
                      />

                      {/* Lặp lại cho số phép tính tương ứng với level */}
                      {Array.from({ length: formData.level * 2 }).map(
                        (_, index) =>
                          index % 2 === 0 ? (
                            // Select cho phép tính
                            <select
                              key={index}
                              value={formData.operators[index / 2]}
                              onChange={(e) => {
                                const newOperators = [...formData.operators];
                                newOperators[index / 2] = e.target.value;
                                setFormData({
                                  ...formData,
                                  operators: newOperators,
                                });
                              }}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="+">+</option>
                              <option value="-">-</option>
                              <option value="×">×</option>
                              <option value="÷">÷</option>
                            </select>
                          ) : (
                            // Input cho số tiếp theo
                            <input
                              key={index}
                              type="number"
                              value={formData.numbers?.[(index - 1) / 2] || ""}
                              onChange={(e) => {
                                const newNumbers = [
                                  ...(formData.numbers || []),
                                ];
                                newNumbers[(index - 1) / 2] = e.target.value;
                                setFormData({
                                  ...formData,
                                  numbers: newNumbers,
                                });
                              }}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Số"
                            />
                          )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kết quả
                    </label>
                    <input
                      type="number"
                      value={formData.answer}
                      onChange={(e) =>
                        setFormData({ ...formData, answer: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Nhập kết quả của phép tính"
                    />
                  </div>
                </>
              )}
              {/* Form câu đố */}
              {gameType === "quiz" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cấp độ
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Cơ bản</option>
                      <option value={2}>Trung bình</option>
                      <option value={3}>Nâng cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Câu hỏi
                    </label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) =>
                        setFormData({ ...formData, question: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập câu hỏi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phân loại
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập phân loại câu hỏi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Các phương án
                    </label>
                    {formData.options.map((option: string, index: number) => (
                      <div key={index} className="mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[index] = e.target.value;
                            setFormData({ ...formData, options: newOptions });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`Phương án ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đáp án đúng
                    </label>
                    <select
                      value={formData.correctAnswerIndex}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswerIndex: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {formData.options.map((_: string, index: number) => (
                        <option key={index} value={index}>
                          Phương án {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal xác nhận xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setIdToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameManagement;
