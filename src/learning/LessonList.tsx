import { useState } from "react";
import { ChevronLeft, Eye, X } from "lucide-react";

// Thêm component FullScreenModal
const FullScreenModal = ({ lesson, onClose }) => {
  if (!lesson) return null;
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      type: "cover",
      content: {
        title: lesson.title,
        subtitle: `${lesson.subject} - ${lesson.grade}`,
        image: "/api/placeholder/1280/720",
      },
    },
    {
      type: "objectives",
      content: {
        title: "Mục tiêu bài học",
        points: [
          "Hiểu được nội dung chính của bài học",
          "Thực hành các kỹ năng cơ bản",
          "Hoàn thành các bài tập thực hành",
        ],
      },
    },
    {
      type: "content",
      content: {
        title: "Nội dung bài học",
        image: "/api/placeholder/800/600",
        text: "Nội dung chi tiết của bài học sẽ được hiển thị ở đây",
      },
    },
    {
      type: "practice",
      content: {
        title: "Bài tập thực hành",
        exercises: [
          "Bài tập 1: Hoàn thành câu hỏi trắc nghiệm",
          "Bài tập 2: Thực hành viết",
          "Bài tập 3: Bài tập tổng hợp",
        ],
      },
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Header */}
      <div className="h-16 bg-gray-800 flex items-center px-4 justify-between text-white">
        <button
          onClick={onClose}
          className="flex items-center hover:text-gray-300"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Thoát
        </button>
        <div className="text-lg">{`Slide ${currentSlide + 1}/${
          slides.length
        }`}</div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Content */}
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
          {slides.map((slide, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`p-3 rounded-lg mb-2 cursor-pointer ${
                currentSlide === index ? "bg-blue-600" : "hover:bg-gray-700"
              } text-white`}
            >
              <div className="text-sm font-medium">{slide.type}</div>
              <div className="text-xs text-gray-400">Slide {index + 1}</div>
            </div>
          ))}
        </div>

        {/* Main Slide Area */}
        <div className="flex-1 bg-white flex flex-col">
          <div className="flex-1 p-12 flex items-center justify-center">
            {slides[currentSlide].type === "cover" && (
              <div className="text-center">
                <img
                  src={slides[currentSlide].content.image}
                  alt=""
                  className="max-w-3xl mx-auto mb-8 rounded-lg shadow-lg"
                />
                <h1 className="text-4xl font-bold mb-4">
                  {slides[currentSlide].content.title}
                </h1>
                <p className="text-xl text-gray-600">
                  {slides[currentSlide].content.subtitle}
                </p>
              </div>
            )}
            {slides[currentSlide].type === "objectives" && (
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-8">
                  {slides[currentSlide].content.title}
                </h2>
                <ul className="space-y-4">
                  {slides[currentSlide].content.points.map((point, i) => (
                    <li key={i} className="flex items-center text-xl">
                      <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Add more slide type renderers as needed */}
          </div>

          {/* Navigation Controls */}
          <div className="h-16 border-t flex items-center justify-between px-8">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
            >
              Slide trước
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
            >
              Slide tiếp theo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component hiển thị chi tiết bài học
const LessonDetail = ({ lesson, onBack }) => {
  const pages = [
    {
      id: 1,
      title: lesson.title,
      type: "cover",
    },
    {
      id: 2,
      title: "Khởi động",
      type: "warmup",
    },
    {
      id: 3,
      title: "Video bài giảng",
      type: "video",
    },
    {
      id: 4,
      title: "Bài tập thực hành",
      type: "practice",
    },
    {
      id: 5,
      title: "Tổng kết",
      type: "summary",
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {pages.map((page) => (
            <div
              key={page.id}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer"
            >
              <img
                src={`/api/placeholder/320/180`}
                alt=""
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <div className="font-medium">{page.title}</div>
              <div className="text-sm text-gray-500">Trang {page.id}/5</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-500 mt-2">Tiếng Việt - Lớp 1</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component hiển thị danh sách bài học
const LessonList = () => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quickViewLesson, setQuickViewLesson] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("Tiếng Việt");
  const [searchQuery, setSearchQuery] = useState("");

  const lessons = [
    {
      id: 1,
      title: "Tuần 17 - Bài 92: Kể chuyện - Ông lão và sếu nhỏ",
      subject: "Tiếng Việt",
      grade: "Lớp 1",
      downloads: "6879",
      views: "9815",
      shares: "1451",
    },
    {
      id: 2,
      title: "Tuần 17 - Bài 91: uông - ươc",
      subject: "Tiếng Việt",
      grade: "Lớp 1",
      downloads: "7740",
      views: "10492",
      shares: "1503",
    },
    {
      id: 3,
      title: "Tuần 17 - Bài 90: uông - ước",
      subject: "Tiếng Việt",
      grade: "Lớp 1",
      downloads: "7799",
      views: "10930",
      shares: "1481",
    },
  ];

  if (selectedLesson) {
    return (
      <LessonDetail
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.subject === selectedSubject &&
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="appearance-none block w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Tiếng Việt</option>
              <option>Toán</option>
              <option>Tiếng Anh</option>
            </select>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Nhập tên bài giảng cần tìm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Tìm kiếm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <img
              src="/api/placeholder/400/200"
              alt=""
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h3 className="font-medium text-lg mb-2">{lesson.title}</h3>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="mr-4">{lesson.subject}</span>
                <span>{lesson.grade}</span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  <span className="mr-4">👁 {lesson.views}</span>
                  <span className="mr-4">⬇️ {lesson.downloads}</span>
                  <span>💌 {lesson.shares}</span>
                </div>

                <button
                  onClick={() => setQuickViewLesson(lesson)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Eye className="w-4 h-4" />
                  Xem nhanh
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FullScreenModal
        lesson={quickViewLesson}
        onClose={() => setQuickViewLesson(null)}
      />
    </div>
  );
};

export default LessonList;
