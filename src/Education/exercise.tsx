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
  CheckSquare,
  Square,
} from "lucide-react";
import { Models } from "appwrite";

import { ID, Query } from "appwrite";

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
// Extend InputHTMLAttributes for directory upload
declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string | boolean;
    directory?: string | boolean;
  }
}

interface AppwriteDocument extends Models.Document {
  name: string;
  path: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  fileId: string; // Appwrite Storage file ID
  bucketId: string; // Appwrite Storage bucket ID
}

interface StoredFile {
  $id: string;
  name: string;
  path: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  fileId: string;
  bucketId: string;
}

interface StoredFile {
  $id: string;
  name: string;
  path: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
}

const Exercise = () => {
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [, setSelectedFile] = useState<StoredFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    currentFile: "",
  });
  const { storage, databases, account } = useAuth();

  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const FILES_COLLECTION_ID = "6757aef2001ea2c6930a";
  const BUCKET_ID = "675fa4df00276e666e01"; // Replace with your Appwrite Storage bucket ID
  // Selection handlers

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

  // File loading
  const loadFiles = async () => {
    setLoading(true);
    setError("");

    try {
      const storedFilesResponse =
        await databases.listDocuments<AppwriteDocument>(
          DATABASE_ID,
          FILES_COLLECTION_ID,
          [Query.orderDesc("$createdAt"), Query.limit(10000)]
        );

      const convertedFiles: StoredFile[] = storedFilesResponse.documents.map(
        (doc) => ({
          $id: doc.$id,
          name: doc.name,
          path: doc.path,
          type: doc.type,
          uploadedBy: doc.uploadedBy,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
          fileId: doc.fileId,
          bucketId: doc.bucketId,
        })
      );

      setStoredFiles(convertedFiles);
    } catch (error: any) {
      console.error("Error loading files:", error);
      setError(error.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        setUploadProgress((prev) => ({
          ...prev,
          current: i + 1,
          currentFile: file.name,
        }));

        try {
          // Kiểm tra file trong database
          const existingInDB = await databases.listDocuments(
            DATABASE_ID,
            FILES_COLLECTION_ID,
            [Query.equal("name", file.name), Query.equal("status", "active")]
          );

          if (existingInDB.documents.length > 0) {
            console.log(
              `File ${file.name} already exists in database, skipping...`
            );
            continue;
          }

          // Upload file và lấy ID từ response
          const uploadedFile = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
          );

          // File ID chính là ID từ response của createFile
          const fileId = uploadedFile.$id;

          // Tạo document trong database với fileId chính xác
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
              fileId: fileId, // Sử dụng fileId từ uploadedFile
              bucketId: BUCKET_ID,
            }
          );
        } catch (error: any) {
          console.error(`Error processing file ${file.name}:`, error);
          errors.push(`Failed to process ${file.name}: ${error.message}`);
          continue;
        }
      }

      await loadFiles();
      setIsModalOpen(false);

      if (errors.length > 0) {
        setError(`Upload completed with some issues:\n${errors.join("\n")}`);
      } else {
        setError("");
      }
    } catch (error: any) {
      console.error("Error in upload process:", error);
      setError(error.message || "Failed to upload files");
    } finally {
      setUploadProgress({
        current: 0,
        total: 0,
        currentFile: "",
      });
    }
  };

  // Delete handlers
  const handleDelete = async (file: StoredFile) => {
    setSelectedFile(file);
    setSelectedFiles(new Set([file.$id]));
    setDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedFiles.size === 0) return;
    const filesToDelete = storedFiles.filter((file) =>
      selectedFiles.has(file.$id)
    );
    setSelectedFile(filesToDelete[0]);
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
          throw error; // Re-throw to be caught by the outer try-catch
        }
      });

      // Execute all delete operations
      await Promise.all(deletePromises);

      // Reset states
      setSelectedFiles(new Set());
      setDeleteModalOpen(false);
      setSelectedFile(null);

      // Show success message
      setError(`Successfully deleted ${allFilesToDelete.length} files`);
      setTimeout(() => setError(""), 1500);

      // Refresh the file list
      await loadFiles();
    } catch (error: any) {
      console.error("Error deleting files:", error);
      setError(`Failed to delete files: ${error.message}`);
      setDeleteModalOpen(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tập tin bài học</h1>
          <p className="mt-2 text-gray-600">
            Xem và quản lý tài liệu và nguồn tài nguyên bài tập
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">Tập tin</div>
                  <p className="text-sm text-gray-500">
                    {storedFiles.length} Tập tin được lưu trữ
                  </p>
                  {selectedFiles.size > 0 && (
                    <p className="text-sm text-blue-600">
                      {selectedFiles.size} Chọn
                    </p>
                  )}
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
                    Xóa mục đã chọn
                  </button>
                )}
                <button
                  onClick={() => loadFiles()}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Đang tải..." : "Tải lại"}
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tải lên tập tin
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* File Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Đang tải tập tin...</p>
              </div>
            ) : storedFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Folder className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Hiện tại không có tập tin
                </h3>
                <p className="mt-2 text-gray-500">
                  Tải tập tin đầu tiên của bạn để bắt đầu
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storedFiles.map((file) => (
                  <div
                    key={file.$id}
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedFiles.has(file.$id)
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-blue-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
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
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Tải lên tệp tin</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {uploadProgress.total > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (uploadProgress.current / uploadProgress.total) * 100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Processing {uploadProgress.current} of {uploadProgress.total}
                </p>
                {uploadProgress.currentFile && (
                  <p className="text-sm text-gray-500 truncate mt-1">
                    Current file: {uploadProgress.currentFile}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-center mb-4">
                    Nhấp để tải lên các tập tin hoặc toàn bộ thư mục
                  </p>
                  <div className="flex gap-4">
                    <div>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        multiple
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Chọn tập tin
                      </label>
                    </div>
                    <div>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="folder-upload"
                        webkitdirectory=""
                        multiple
                      />
                      <label
                        htmlFor="folder-upload"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Chọn thư mục
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Bạn có chắc chắn muốn xóa mục này?{" "}
                  {selectedFiles.size === 1
                    ? "Tập tin này"
                    : `${selectedFiles.size} items`}
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
    </div>
  );
};

export default Exercise;