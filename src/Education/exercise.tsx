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
  Download,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { ExecutionMethod, Models } from "appwrite";
import Navigation from "../Navigation/Navigation";
import { ID, Query } from "appwrite";

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
}

interface FileItem {
  id: string;
  name: string;
  type: string;
  size?: number;
  isDirectory: boolean;
  path?: string;
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
  const [, setFiles] = useState<FileItem[]>([]);
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [, setSelectedFile] = useState<StoredFile | null>(null);

  const { functions, databases, account } = useAuth();
  const functionId = "6757b08826369e75eaaf";
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const FILES_COLLECTION_ID = "6757aef2001ea2c6930a";

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
      // Replace get-folder-content with list-files endpoint
      const response = await functions.createExecution(
        functionId,
        JSON.stringify({}), // No need for folder path since we're listing all files
        false,
        "/list-files",
        ExecutionMethod.GET
      );

      if (response?.responseBody) {
        const data = JSON.parse(response.responseBody);
        if (data.success) {
          setFiles(data.files || []);
        }
      }

      // Load stored file records from database
      const storedFilesResponse =
        await databases.listDocuments<AppwriteDocument>(
          DATABASE_ID,
          FILES_COLLECTION_ID,
          [Query.orderDesc("$createdAt")]
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

  // File upload handling
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadStatus("Processing files...");
    let processedCount = 0;

    try {
      const user = await account.get();
      console.log("Current user:", user); // Debug log

      for (const file of Array.from(files)) {
        console.log("Processing file:", file.name); // Debug log
        setUploadStatus(
          `Processing ${processedCount + 1} of ${files.length}: ${file.name}`
        );

        // Read file as base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            console.log("File read successfully"); // Debug log
            const result = e.target?.result;
            if (typeof result === "string") {
              const base64 = result.split(",")[1];
              resolve(base64);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });

        // Prepare upload data
        const uploadData = {
          name: file.name,
          type: file.type,
          userId: user.$id,
          fileData: base64Data,
        };

        console.log("Sending file to cloud function..."); // Debug log

        // Upload to server via cloud function
        const response = await functions.createExecution(
          functionId,
          JSON.stringify(uploadData),
          false,
          "/store-file",
          ExecutionMethod.POST
        );

        console.log("Cloud function response:", response); // Debug log

        const result = JSON.parse(response.responseBody);

        if (!result.success) {
          throw new Error(result.message || "Failed to upload file");
        }

        console.log("File uploaded successfully, creating database record..."); // Debug log

        // Create database record
        const dbRecord = await databases.createDocument(
          DATABASE_ID,
          FILES_COLLECTION_ID,
          ID.unique(),
          {
            name: file.name,
            path: result.file.path,
            type: file.type,
            uploadedBy: user.$id,
            uploadedAt: new Date().toISOString(),
            status: "active",
          }
        );

        console.log("Database record created:", dbRecord); // Debug log

        processedCount++;
        setUploadStatus(
          `Successfully processed ${processedCount} of ${files.length} files`
        );
      }

      await loadFiles();
      setIsModalOpen(false);
      setUploadStatus("");
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus(`Upload failed: ${error.message}`);
      setError(error.message || "Failed to upload files");
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
      const additionalFiles = storedFiles.filter((file) =>
        filesToDelete.some(
          (selectedFile) =>
            file.path.startsWith(selectedFile.path) &&
            !selectedFiles.has(file.$id)
        )
      );

      const allFilesToDelete = [...filesToDelete, ...additionalFiles];

      await Promise.all(
        allFilesToDelete.map((file) =>
          databases.deleteDocument(DATABASE_ID, FILES_COLLECTION_ID, file.$id)
        )
      );

      setSelectedFiles(new Set());
      setDeleteModalOpen(false);
      setSelectedFile(null);

      setError(`Successfully deleted ${allFilesToDelete.length} files`);
      setTimeout(() => setError(""), 1500);
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
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exercise Files</h1>
          <p className="mt-2 text-gray-600">
            View and manage exercise materials and resources
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">Files</div>
                  <p className="text-sm text-gray-500">
                    {storedFiles.length} files stored
                  </p>
                  {selectedFiles.size > 0 && (
                    <p className="text-sm text-blue-600">
                      {selectedFiles.size} selected
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
                    Select All
                  </button>
                )}
                {selectedFiles.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                )}
                <button
                  onClick={() => loadFiles()}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Upload File
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
                <p className="mt-4 text-gray-600">Loading files...</p>
              </div>
            ) : storedFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Folder className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No files yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Upload your first file to get started
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
                        <button
                          onClick={() => {
                            /* Add download logic */
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
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
              <h2 className="text-xl font-semibold">Upload Files</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {uploadStatus && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm">
                {uploadStatus}
              </div>
            )}

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-center mb-4">
                    Click to upload files or entire folders
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
                        Select Files
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
                        Select Folder
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
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
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
                  Are you sure you want to delete{" "}
                  {selectedFiles.size === 1
                    ? "this item"
                    : `${selectedFiles.size} items`}
                  ?
                </p>
                <p className="mt-2 text-sm text-red-500">
                  This action cannot be undone.
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
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default Exercise;
