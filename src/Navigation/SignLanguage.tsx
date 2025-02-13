import { useState, useEffect } from "react";
import Navigation from "../Navigation/Navigation";
import { motion } from "framer-motion";
import { Search, PlayCircle, Clock, X } from "lucide-react";

import { useAuth } from "../contexts/auth/authProvider";
interface VideoCategory {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}

interface Video {
  videoId: string;
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string;
  imageId?: string;
  duration: string;
  category: string;
  viewCount: number;
}
interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}
const SignLanguage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const { databases, storage } = useAuth();
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const COLLECTION_ID_SIGNLANGUAGE = "67a1c0f8002253f461fa";
  const BUCKET_ID_SIGNLANGUAGE = "67a1c2fd0025c74b9e3c";
  // Thêm state để quản lý video đang phát
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [suggestions, setSuggestions] = useState<Video[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Số video hiển thị trên mỗi trang
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  // Lấy videos cho trang hiện tại
  const currentVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Thêm hàm xử lý khi click vào video
  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
    updateViewCount(video.id); // Thêm dòng này
  };
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID_SIGNLANGUAGE
        );

        const fetchedVideos = response.documents.map((doc) => ({
          id: doc.$id,
          title: doc.title,
          subtitle: doc.subtitle || null,
          imageId: doc.imageId || null,
          category: doc.category,
          thumbnail: storage
            .getFilePreview(BUCKET_ID_SIGNLANGUAGE, doc.thumbnailId)
            .toString(),
          duration: doc.duration,
          videoId: doc.videoId,
          viewCount: doc.viewCount || 0,
        }));

        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);
  const updateViewCount = async (videoId: string) => {
    try {
      // Lấy document hiện tại
      const document = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID_SIGNLANGUAGE,
        videoId
      );

      // Tăng viewCount lên 1
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_SIGNLANGUAGE,
        videoId,
        {
          viewCount: (document.viewCount || 0) + 1,
        }
      );

      // Cập nhật state videos
      setVideos(
        videos.map((video) => {
          if (video.id === videoId) {
            return {
              ...video,
              viewCount: (video.viewCount || 0) + 1,
            };
          }
          return video;
        })
      );
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };
  // Hàm xử lý tìm kiếm và hiển thị gợi ý
  const handleSearch = (value: string) => {
    setSearchTerm(value);

    if (value.trim()) {
      const searchResults = videos.filter((video) =>
        video.title.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(searchResults);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Hàm xử lý khi chọn một gợi ý
  const handleSelectSuggestion = (video: Video) => {
    setSearchTerm(video.title);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedVideo(video);
    setShowVideoModal(true);
  };
  // Thêm xử lý click outside để đóng suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector(".search-container");
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const categories: VideoCategory[] = [
    {
      id: "all",
      title: "Tất cả bài học",
      description: "Xem tất cả các bài học ngôn ngữ ký hiệu",
      videos: videos, // Hiển thị tất cả video
    },
    {
      id: "basic",
      title: "Từ vựng cơ bản",
      description:
        "Học các từ vựng và cụm từ thông dụng trong giao tiếp hàng ngày",
      videos: videos.filter((v) => v.category === "basic"),
    },
    {
      id: "numbers",
      title: "Số đếm và đơn vị",
      description: "Học cách biểu đạt số, đơn vị đo lường trong NNKH",
      videos: videos.filter((v) => v.category === "numbers"),
    },
    {
      id: "conversation",
      title: "Hội thoại",
      description: "Các tình huống giao tiếp thông dụng trong cuộc sống",
      videos: videos.filter((v) => v.category === "conversation"),
    },
    {
      id: "education",
      title: "Giáo dục",
      description: "Từ vựng và cách diễn đạt trong môi trường học tập",
      videos: videos.filter((v) => v.category === "education"),
    },
  ];

  // Filter videos based on search and category
  useEffect(() => {
    let results = [...videos];

    if (selectedCategory && selectedCategory !== "all") {
      // Chỉ filter khi có category được chọn và không phải "all"
      results = results.filter((video) => video.category === selectedCategory);
    }

    if (searchTerm) {
      results = results.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVideos(results);
  }, [searchTerm, selectedCategory, videos]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-center mb-6"
          >
            Học Ngôn Ngữ Ký Hiệu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-center text-gray-600 mb-12"
          >
            Khám phá thế giới giao tiếp không lời qua video bài giảng
          </motion.p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Tìm kiếm bài học..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (searchTerm) setShowSuggestions(true);
              }}
              className="w-full px-6 py-4 rounded-full bg-white shadow-xl focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700">
              <Search className="w-5 h-5" />
            </button>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                {suggestions.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleSelectSuggestion(video)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {video.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {video.duration} • {video.viewCount} lượt xem
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Danh mục bài học</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-2xl p-6 shadow-lg cursor-pointer
            ${selectedCategory === category.id ? "ring-2 ring-purple-600" : ""}
          `}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-semibold mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {category.description}
                  </p>
                  <div className="mt-auto">
                    <span className="text-sm text-purple-600">
                      {category.videos.length} bài học
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Video Grid Section */}

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.title
                : "Tất cả bài học"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentVideos.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => handleVideoClick(video)} // Thêm xử lý click
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{video.viewCount} lượt xem</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
          ${
            currentPage === index + 1
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-600 hover:bg-purple-50"
          }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
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

export default SignLanguage;
