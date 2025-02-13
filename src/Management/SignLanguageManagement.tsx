import React, { useState, useEffect } from "react";
import { Upload, Plus, Trash2, Loader2, Play, X, Edit2 } from "lucide-react";
import { useAuth } from "../contexts/auth/authProvider";
import { ID } from "appwrite";
import { toast } from "react-hot-toast";

interface Video {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  description: string;
  thumbnailId: string;
  imageId?: string;
  duration: string;
  videoId: string;
}
interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}
const SignLanguageManagement = () => {
  const { storage, databases } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const COLLECTION_ID_SIGNLANGUAGE = "67a1c0f8002253f461fa";
  const BUCKET_ID_SIGNLANGUAGE = "67a1c2fd0025c74b9e3c";
  const [, setError] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    videoId: string | null;
    fileId: string | null;
    thumbnailId: string | null;
  }>({
    isOpen: false,
    videoId: null,
    fileId: null,
    thumbnailId: null,
  });
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "basic",
    description: "",
    videoFile: null as File | null,
    imageFile: null as File | null,
  });
  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      category: "basic",
      description: "",
      videoFile: null,
      imageFile: null,
    });
    setIsEditing(false);
    setSelectedVideo(null);
    setError(null);
  };
  const categories = [
    { id: "basic", name: "Từ vựng cơ bản" },
    { id: "numbers", name: "Số đếm và đơn vị" },
    { id: "conversation", name: "Hội thoại" },
    { id: "education", name: "Giáo dục" },
  ];

  // Hàm tạo thumbnail từ video
  const generateThumbnail = (videoFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Thêm sự kiện loadedmetadata để đảm bảo video đã load
      video.onloadedmetadata = () => {
        // Đặt kích thước canvas bằng với video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Đặt thời gian video về frame đầu tiên
        video.currentTime = 1; // Lấy frame tại giây thứ 1 để tránh màn đen
      };

      // Sự kiện khi video đã seek tới thời điểm mong muốn
      video.onseeked = () => {
        // Vẽ frame hiện tại lên canvas
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Chuyển canvas thành file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], "thumbnail.jpg", {
                type: "image/jpeg",
              });
              resolve(thumbnailFile);
            }
          },
          "image/jpeg",
          0.8
        );
      };

      // Load video từ file
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const getVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      };
      video.src = URL.createObjectURL(file);
    });
  };
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedVideo) return;

      const updateData: any = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        category: formData.category,
        description: formData.description,
        updatedAt: new Date().toISOString(),
      };

      // Upload video mới nếu có
      if (formData.videoFile) {
        // Xóa video cũ
        await storage.deleteFile(BUCKET_ID_SIGNLANGUAGE, selectedVideo.videoId);

        // Upload video mới
        const videoFile = await storage.createFile(
          BUCKET_ID_SIGNLANGUAGE,
          ID.unique(),
          formData.videoFile
        );
        updateData.videoId = videoFile.$id;

        // Tạo thumbnail mới
        const thumbnailFile = await generateThumbnail(formData.videoFile);
        const uploadedThumbnail = await storage.createFile(
          BUCKET_ID_SIGNLANGUAGE,
          ID.unique(),
          thumbnailFile
        );
        updateData.thumbnailId = uploadedThumbnail.$id;
        updateData.duration = await getVideoDuration(formData.videoFile);
      }

      // Upload ảnh mới nếu có
      if (formData.imageFile) {
        if (selectedVideo.imageId) {
          await storage.deleteFile(
            BUCKET_ID_SIGNLANGUAGE,
            selectedVideo.imageId
          );
        }
        const uploadedImage = await storage.createFile(
          BUCKET_ID_SIGNLANGUAGE,
          ID.unique(),
          formData.imageFile
        );
        updateData.imageId = uploadedImage.$id;
      }

      // Cập nhật document
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_SIGNLANGUAGE,
        selectedVideo.id,
        updateData
      );

      // Cập nhật UI
      setVideos(
        videos.map((v) =>
          v.id === selectedVideo.id ? { ...v, ...updateData } : v
        )
      );

      setIsModalOpen(false);
      setIsEditing(false);
      setSelectedVideo(null);
      resetForm();
      toast.success("Cập nhật video thành công!");
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Có lỗi xảy ra khi cập nhật video");
    } finally {
      setIsLoading(false);
    }
  };
  const ImagePreviewModal = ({ imageUrl, onClose }: ImagePreviewModalProps) => (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center">
      <div className="relative w-[80vw] max-w-[900px]">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full object-contain rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate các trường bắt buộc
      if (!formData.videoFile || !formData.title) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      // Kiểm tra kích thước video
      if (formData.videoFile.size > 100 * 1024 * 1024) {
        // 100MB
        throw new Error("Video không được vượt quá 100MB");
      }

      // Kiểm tra kích thước ảnh nếu có
      if (formData.imageFile && formData.imageFile.size > 5 * 1024 * 1024) {
        // 5MB
        throw new Error("Ảnh không được vượt quá 5MB");
      }

      // Upload video chính
      const videoFile = await storage.createFile(
        BUCKET_ID_SIGNLANGUAGE,
        ID.unique(),
        formData.videoFile
      );

      // Tạo và upload thumbnail từ video
      const thumbnailFile = await generateThumbnail(formData.videoFile);
      const uploadedThumbnail = await storage.createFile(
        BUCKET_ID_SIGNLANGUAGE,
        ID.unique(),
        thumbnailFile
      );

      // Upload ảnh phụ nếu có
      let imageId: string | undefined = undefined;
      if (formData.imageFile) {
        const uploadedImage = await storage.createFile(
          BUCKET_ID_SIGNLANGUAGE,
          ID.unique(),
          formData.imageFile
        );
        imageId = uploadedImage.$id;
      }

      // Lấy thời lượng video
      const duration = await getVideoDuration(formData.videoFile);

      // Tạo document trong database
      const document = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID_SIGNLANGUAGE,
        ID.unique(),
        {
          title: formData.title,
          subtitle: formData.subtitle || null,
          category: formData.category,
          description: formData.description,
          thumbnailId: uploadedThumbnail.$id,
          imageId: imageId,
          videoId: videoFile.$id,
          duration: duration,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      // Tạo object video mới để cập nhật UI
      const newVideo: Video = {
        id: document.$id,
        title: document.title,
        subtitle: document.subtitle,
        category: document.category,
        description: document.description,
        thumbnailId: uploadedThumbnail.$id,
        imageId: imageId,
        duration: duration,
        videoId: videoFile.$id,
      };

      // Cập nhật state videos
      setVideos((prevVideos) => [...prevVideos, newVideo]);

      // Reset form và đóng modal
      setFormData({
        title: "",
        subtitle: "",
        category: "basic",
        description: "",
        videoFile: null,
        imageFile: null,
      });

      setIsModalOpen(false);
      toast.success("Thêm video thành công!");

      // Xử lý cleanup
      if (formData.videoFile) {
        URL.revokeObjectURL(URL.createObjectURL(formData.videoFile));
      }
      if (formData.imageFile) {
        URL.revokeObjectURL(URL.createObjectURL(formData.imageFile));
      }
    } catch (error) {
      console.error("Error uploading:", error);

      // Xử lý các loại lỗi cụ thể
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Có lỗi xảy ra khi thêm video");
      }

      // Cleanup trong trường hợp lỗi
      try {
        // Xóa các file đã upload nếu có lỗi xảy ra
        if (formData.videoFile) {
          URL.revokeObjectURL(URL.createObjectURL(formData.videoFile));
        }
        if (formData.imageFile) {
          URL.revokeObjectURL(URL.createObjectURL(formData.imageFile));
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (
    videoId: string,
    fileId: string,
    thumbnailId: string
  ) => {
    setDeleteConfirmModal({
      isOpen: true,
      videoId,
      fileId,
      thumbnailId,
    });
  };
  const confirmDelete = async () => {
    if (
      !deleteConfirmModal.videoId ||
      !deleteConfirmModal.fileId ||
      !deleteConfirmModal.thumbnailId
    )
      return;

    setIsDeleting(true);
    try {
      await storage.deleteFile(
        BUCKET_ID_SIGNLANGUAGE,
        deleteConfirmModal.fileId
      );
      await storage.deleteFile(
        BUCKET_ID_SIGNLANGUAGE,
        deleteConfirmModal.thumbnailId
      );
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID_SIGNLANGUAGE,
        deleteConfirmModal.videoId
      );

      setVideos(
        videos.filter((video) => video.id !== deleteConfirmModal.videoId)
      );
      toast.success("Xóa video thành công!");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Có lỗi xảy ra khi xóa video");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmModal({
        isOpen: false,
        videoId: null,
        fileId: null,
        thumbnailId: null,
      });
    }
  };
  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID_SIGNLANGUAGE
        );

        const fetchedVideos: Video[] = response.documents.map((doc) => ({
          id: doc.$id,
          title: doc.title,
          subtitle: doc.subtitle || "", // Thêm dòng này
          category: doc.category,
          description: doc.description || "",
          thumbnailId: doc.thumbnailId || "",
          videoId: doc.videoId || "",
          duration: doc.duration || "0:00",
          imageId: doc.imageId || "",
        }));
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast.error("Không thể tải danh sách video");
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">
            Quản lý video ngôn ngữ ký hiệu
          </h2>
          <p className="text-gray-600">
            Thêm và quản lý các video bài giảng ngôn ngữ ký hiệu
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Thêm video mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-lg shadow border border-gray-200"
          >
            <div
              className="relative aspect-video cursor-pointer group"
              onClick={() => video.videoId && handleVideoClick(video)}
            >
              <img
                src={storage
                  .getFilePreview(BUCKET_ID_SIGNLANGUAGE, video.thumbnailId)
                  .toString()}
                alt={video.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/25">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                {video.duration}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-medium mb-2">{video.title}</h3>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {categories.find((cat) => cat.id === video.category)?.name ||
                  video.category}
              </span>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({
                      title: video.title,
                      subtitle: video.subtitle || "",
                      category: video.category,
                      description: video.description,
                      videoFile: null,
                      imageFile: null,
                    });
                    setIsEditing(true); // Đánh dấu đang ở chế độ chỉnh sửa
                    setIsModalOpen(true);
                    setSelectedVideo(video);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(video.id, video.videoId, video.thumbnailId);
                  }}
                  disabled={isDeleting}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay với hiệu ứng blur */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {selectedVideo.title}
              </h1>
            </div>

            {/* Subtitle và Image Section */}
            <div className="flex p-6 gap-8">
              <div className="w-2/3 pr-6 flex items-center pl-8">
                {selectedVideo.subtitle && (
                  <h2 className="text-2xl font-bold">
                    {selectedVideo.subtitle}
                  </h2>
                )}
              </div>

              {selectedVideo.imageId && (
                <div className="w-1/3">
                  <div
                    className="relative group rounded-xl overflow-hidden cursor-zoom-in"
                    onClick={() => setShowImagePreview(true)}
                  >
                    <img
                      src={storage
                        .getFilePreview(
                          BUCKET_ID_SIGNLANGUAGE,
                          selectedVideo.imageId
                        )
                        .toString()}
                      alt="Supplementary"
                      className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        console.error("Error loading image");
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-medium px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm">
                        Xem chi tiết
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Player */}
            <div className="px-6 pb-6">
              <div className="aspect-video rounded-xl overflow-hidden bg-black/95 shadow-lg">
                <video
                  src={storage
                    .getFileView(BUCKET_ID_SIGNLANGUAGE, selectedVideo.videoId)
                    .toString()}
                  controls
                  autoPlay
                  className="w-full h-full"
                  playsInline
                >
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setSelectedVideo(null);
                  }}
                  className="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {" "}
            {/* Thêm max-h-[90vh] và overflow-y-auto */}
            <h3 className="text-xl font-semibold mb-4">
              {isEditing ? "Chỉnh sửa video" : "Thêm video mới"}
            </h3>
            <form
              onSubmit={isEditing ? handleEdit : handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề phụ (không bắt buộc)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh phụ {!isEditing && "(không bắt buộc)"}
                </label>
                {/* Hiển thị ảnh hiện tại nếu đang chỉnh sửa và có ảnh */}
                {isEditing && selectedVideo?.imageId && !formData.imageFile && (
                  <div className="mb-2">
                    <img
                      src={storage
                        .getFilePreview(
                          BUCKET_ID_SIGNLANGUAGE,
                          selectedVideo.imageId
                        )
                        .toString()}
                      alt="Current supplementary"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mt-1">Ảnh hiện tại</p>
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, imageFile: file });
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {formData.imageFile
                        ? formData.imageFile.name
                        : "Kéo thả ảnh hoặc click để chọn file"}
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thêm vào phần input video trong form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video {!isEditing && "(bắt buộc)"}
                </label>

                {/* Hiển thị video hiện tại nếu đang ở chế độ edit */}
                {isEditing && selectedVideo && !formData.videoFile && (
                  <div className="mb-4">
                    <video
                      src={storage
                        .getFileView(
                          BUCKET_ID_SIGNLANGUAGE,
                          selectedVideo.videoId
                        )
                        .toString()}
                      controls
                      autoPlay
                      className="w-full h-48 object-cover rounded-lg"
                    >
                      Trình duyệt không hỗ trợ video
                    </video>
                    <p className="text-sm text-gray-500 mt-1">Video hiện tại</p>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    required={!isEditing}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, videoFile: file });
                      }
                    }}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {formData.videoFile
                        ? formData.videoFile.name
                        : isEditing
                        ? "Chọn video mới (không bắt buộc)"
                        : "Kéo thả video hoặc click để chọn file"}
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setSelectedVideo(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : isEditing ? (
                    "Cập nhật"
                  ) : (
                    "Thêm mới"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa video này? Hành động này không thể hoàn
              tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteConfirmModal({
                    isOpen: false,
                    videoId: null,
                    fileId: null,
                    thumbnailId: null,
                  })
                }
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showImagePreview && selectedVideo?.imageId && (
        <ImagePreviewModal
          imageUrl={storage
            .getFilePreview(BUCKET_ID_SIGNLANGUAGE, selectedVideo.imageId)
            .toString()}
          onClose={() => setShowImagePreview(false)}
        />
      )}
    </div>
  );
};

export default SignLanguageManagement;
