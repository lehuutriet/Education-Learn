import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth/authProvider";
import {
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Folder,
  Upload,
  Plus,
  X,
  AlertCircle,
  Trash2,
  Book,
  Headphones,
  CheckSquare,
  Square,
} from "lucide-react";
import { Models } from "appwrite";
import { ID, Query } from "appwrite";

// Định nghĩa types cho contentType và level
type ContentType = "story" | "reading" | "writing" | "listening" | "exercise";
type Level = "beginner" | "intermediate" | "advanced";

interface ContentTypeInfo {
  id: ContentType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const contentTypes: ContentTypeInfo[] = [
  {
    id: "story",
    name: "Truyện kể",
    icon: <Book className="w-5 h-5" />,
    description: "Nội dung truyện kể cho trẻ",
  },
  {
    id: "reading",
    name: "Tập đọc",
    icon: <FileText className="w-5 h-5" />,
    description: "Bài tập đọc",
  },
  {
    id: "writing",
    name: "Tập viết",
    icon: <FileText className="w-5 h-5" />,
    description: "Bài tập viết",
  },
  {
    id: "listening",
    name: "Tập nghe",
    icon: <Headphones className="w-5 h-5" />,
    description: "Bài tập nghe",
  },
  {
    id: "exercise",
    name: "Bài tập",
    icon: <Book className="w-5 h-5" />,
    description: "Bài tập tổng hợp",
  },
];

interface FileIconProps {
  type: string;
}

const FileIcon = ({ type }: FileIconProps) => {
  if (type.startsWith("image"))
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (type.startsWith("video"))
    return <Video className="w-5 h-5 text-red-500" />;
  if (type === "application/pdf")
    return <FileText className="w-5 h-5 text-orange-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
};

interface StoredFile extends Models.Document {
  name: string;
  path: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  fileId: string;
  bucketId: string;
  contentType: ContentType;
  level: Level;
  description: string;
}

const Exercise = () => {
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<
    ContentType | ""
  >("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | "">("");
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    currentFile: "",
  });

  const { storage, databases, account } = useAuth();

  const [formData, setFormData] = useState<{
    contentType: ContentType;
    level: Level;
    description: string;
  }>({
    contentType: "story",
    level: "beginner",
    description: "",
  });

  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const FILES_COLLECTION_ID = "6757aef2001ea2c6930a";
  const BUCKET_ID = "675fa4df00276e666e01";
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId);
      } else {
        newSelection.add(fileId);
      }
      return newSelection;
    });
  };

  const selectAll = () => {
    if (selectedFiles.size === storedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(storedFiles.map((file) => file.$id)));
    }
  };
  const loadFiles = async () => {
    setLoading(true);
    setError("");

    try {
      let queries = [Query.orderDesc("$createdAt"), Query.limit(10000)];

      if (selectedContentType) {
        queries.push(Query.equal("contentType", selectedContentType));
      }

      if (selectedLevel) {
        queries.push(Query.equal("level", selectedLevel));
      }

      const response = await databases.listDocuments<StoredFile>(
        DATABASE_ID,
        FILES_COLLECTION_ID,
        queries
      );

      setStoredFiles(response.documents);
    } catch (error: any) {
      console.error("Error loading files:", error);
      setError(error.message || "Không thể tải danh sách tệp tin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [selectedContentType, selectedLevel]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUploading(true);
    const files = event.target.files;
    if (!files?.length) return;

    setUploadProgress({
      current: 0,
      total: files.length,
      currentFile: "",
    });

    try {
      const user = await account.get();
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({
          current: i + 1,
          total: files.length,
          currentFile: file.name,
        });

        try {
          const uploadedFile = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
          );

          await databases.createDocument(
            DATABASE_ID,
            FILES_COLLECTION_ID,
            ID.unique(),
            {
              name: file.name,
              path: file.webkitRelativePath || file.name,
              type: file.type,
              uploadedBy: user.name,
              uploadedAt: new Date().toISOString(),
              status: "active",
              fileId: uploadedFile.$id,
              bucketId: BUCKET_ID,
              contentType: formData.contentType,
              level: formData.level,
              description: formData.description,
            }
          );
        } catch (error: any) {
          console.error(`Error processing file ${file.name}:`, error);
          errors.push(`Lỗi xử lý ${file.name}: ${error.message}`);
          continue;
        }
      }

      await loadFiles();
      setIsModalOpen(false);
      setFormData({
        contentType: "story",
        level: "beginner",
        description: "",
      });

      if (errors.length > 0) {
        setError(`Tải lên hoàn tất với một số lỗi:\n${errors.join("\n")}`);
      }
    } catch (error: any) {
      console.error("Error in upload process:", error);
      setError(error.message || "Lỗi tải lên tệp tin");
    } finally {
      setIsUploading(false);
      setUploadProgress({
        current: 0,
        total: 0,
        currentFile: "",
      });
    }
  };

  // Thêm các hàm xử lý xóa
  const handleDelete = async (file: StoredFile) => {
    setSelectedFiles(new Set([file.$id]));
    setDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedFiles.size === 0) return;
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedFiles.size === 0) return;

    try {
      const filesToDelete = storedFiles.filter((file) =>
        selectedFiles.has(file.$id)
      );

      // Find any additional files that might be in subdirectories
      const additionalFiles = storedFiles.filter((file) =>
        filesToDelete.some(
          (selectedFile) =>
            file.path.startsWith(selectedFile.path) &&
            !selectedFiles.has(file.$id)
        )
      );

      const allFilesToDelete = [...filesToDelete, ...additionalFiles];

      // Create an array of promises for all delete operations
      const deletePromises = allFilesToDelete.map(async (file) => {
        try {
          // Delete from Storage first
          if (file.fileId && file.bucketId) {
            await storage.deleteFile(file.bucketId, file.fileId);
          }

          // Then delete from Database
          await databases.deleteDocument(
            DATABASE_ID,
            FILES_COLLECTION_ID,
            file.$id
          );
        } catch (error) {
          console.error(`Error deleting file ${file.name}:`, error);
          throw error;
        }
      });

      // Execute all delete operations
      await Promise.all(deletePromises);

      // Reset states
      setSelectedFiles(new Set());
      setDeleteModalOpen(false);

      // Show success message
      setError(`Đã xóa thành công ${allFilesToDelete.length} tập tin`);
      setTimeout(() => setError(""), 1500);

      // Refresh the file list
      await loadFiles();
    } catch (error: any) {
      console.error("Error deleting files:", error);
      setError(`Không thể xóa tập tin: ${error.message}`);
      setDeleteModalOpen(false);
    }
  };

  const handleContentTypeChange = (value: string) => {
    setSelectedContentType(value as ContentType | "");
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value as Level | "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý nội dung học tập
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý và tổ chức nội dung học tập theo từng loại và cấp độ
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại nội dung
                </label>
                <div className="relative">
                  <select
                    value={selectedContentType}
                    onChange={(e) => handleContentTypeChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option value="">Tất cả loại nội dung</option>
                    {contentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp độ
                </label>
                <div className="relative">
                  <select
                    value={selectedLevel}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option value="">Tất cả cấp độ</option>
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tải lên nội dung mới
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {storedFiles.length > 0 && (
              <button
                onClick={selectAll}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                {selectedFiles.size === storedFiles.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                Chọn tất cả
              </button>
            )}
            {selectedFiles.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa mục đã chọn ({selectedFiles.size})
              </button>
            )}
          </div>
          {/* Cập nhật lại layout của từng item file */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storedFiles.map((file) => (
              <div
                key={file.$id}
                className="group bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleFileSelection(file.$id)}
                    className="mt-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    {selectedFiles.has(file.$id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <FileIcon type={file.type} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rest of the file item content */}
                <div className="ml-8">
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {contentTypes.find((t) => t.id === file.contentType)
                        ?.name || "Không phân loại"}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {file.level === "beginner"
                        ? "Cơ bản"
                        : file.level === "intermediate"
                        ? "Trung cấp"
                        : file.level === "advanced"
                        ? "Nâng cao"
                        : "Không xác định"}
                    </span>
                  </div>

                  {file.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {file.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <button
                      onClick={() =>
                        window.open(
                          storage
                            .getFileView(file.bucketId, file.fileId)
                            .toString(),
                          "_blank"
                        )
                      }
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Xem nội dung
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Content Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Đang tải nội dung...</p>
              </div>
            ) : storedFiles.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Chưa có nội dung
                </h3>
                <p className="mt-2 text-gray-500">
                  Bắt đầu bằng cách tải lên nội dung đầu tiên
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storedFiles.map((file) => (
                  <div
                    key={file.$id}
                    className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => toggleFileSelection(file.$id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedFiles.has(file.$id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <FileIcon type={file.type} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {contentTypes.find((t) => t.id === file.contentType)
                          ?.name || "Không phân loại"}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {file.level === "beginner"
                          ? "Cơ bản"
                          : file.level === "intermediate"
                          ? "Trung cấp"
                          : file.level === "advanced"
                          ? "Nâng cao"
                          : "Không xác định"}
                      </span>
                    </div>

                    {file.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {file.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <button
                        onClick={() =>
                          window.open(
                            storage
                              .getFileView(file.bucketId, file.fileId)
                              .toString(),
                            "_blank"
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem nội dung
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFiles(new Set([file.$id]));
                          setDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Tải lên nội dung mới</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại nội dung
                </label>
                <select
                  value={formData.contentType}
                  disabled={isUploading}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contentType: e.target.value as ContentType,
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {contentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp độ
                </label>
                <select
                  value={formData.level}
                  disabled={isUploading}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value as Level })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Cơ bản</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  disabled={isUploading}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Nhập mô tả về nội dung..."
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Tải lên tệp tin</span>
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        multiple
                      />
                    </label>
                    <p className="pl-1">hoặc kéo thả vào đây</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600 mt-2">
                    PDF, Word, Excel, PowerPoint, Audio và Video
                  </p>
                </div>
              </div>

              {uploadProgress.total > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (uploadProgress.current / uploadProgress.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Đang tải {uploadProgress.current} / {uploadProgress.total}{" "}
                    tệp tin
                  </p>
                  {uploadProgress.currentFile && (
                    <p className="text-sm text-gray-500 truncate">
                      Đang xử lý: {uploadProgress.currentFile}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedFiles.size > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Xác nhận xóa</h2>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">
                  Bạn có chắc chắn muốn xóa{" "}
                  {selectedFiles.size === 1
                    ? "tập tin này"
                    : `${selectedFiles.size} tập tin`}
                  ?
                </p>
                <p className="mt-2 text-sm text-red-500">
                  Không thể hoàn tác hành động này
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedFiles(new Set());
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 max-w-md animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-700 hover:text-red-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Exercise;
