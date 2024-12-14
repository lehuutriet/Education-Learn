import { useState } from "react";
import { Search, Eye, Download, Share2 } from "lucide-react";
import Navigation from "../Navigation/Navigation";

const LessonGrid = () => {
  const [selectedGrade, setSelectedGrade] = useState("Lớp 1");
  const [selectedSubject, setSelectedSubject] = useState("Tiếng Việt");
  const [searchQuery, setSearchQuery] = useState("");

  const grades = [
    "Lớp 1",
    "Lớp 2",
    "Lớp 3",
    "Lớp 4",
    "Lớp 5",
    "Lớp 6",
    "Lớp 7",
    "Lớp 8",
    "Lớp 9",
    "Lớp 10",
    "Lớp 11",
    "Lớp 12",
  ];

  const subjects = [
    { id: "tiengviet", name: "Tiếng Việt" },
    { id: "toan", name: "Toán" },
    { id: "daoduc", name: "Đạo đức" },
    { id: "congnghe", name: "Công nghệ" },
    { id: "tinhoc", name: "Tin học" },
    { id: "mythuat", name: "Mĩ thuật" },
    { id: "hoatdong", name: "Hoạt động trải nghiệm" },
    { id: "khoahoc", name: "Khoa học" },
    { id: "lichsu", name: "Lịch sử và Địa lí" },
  ];

  const lessons = [
    {
      id: 1,
      title: "Tuần 16_Bài đọc 3: Chuyện nhỏ trong lớp học",
      subject: "Tiếng Việt",
      grade: "Lớp 5",
      week: 16,
      downloads: 210,
      views: 657,
      shares: 0,
      image: "/api/placeholder/400/320",
    },
    {
      id: 2,
      title: "Tuần 16_Luyện từ và câu: Kết từ",
      subject: "Tiếng Việt",
      grade: "Lớp 5",
      week: 16,
      downloads: 227,
      views: 485,
      shares: 1,
      image: "/api/placeholder/400/320",
    },
    {
      id: 3,
      title: "Tuần 16_Trao đổi: Em đọc sách báo",
      subject: "Tiếng Việt",
      grade: "Lớp 5",
      week: 16,
      downloads: 149,
      views: 278,
      shares: 0,
      image: "/api/placeholder/400/320",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="relative mb-8 text-center bg-gradient-to-b from-orange-50 to-white py-20">
        {/* Decorative circles */}
        <div className="absolute top-8 left-12 w-6 h-6 bg-orange-400 rounded-full"></div>
        <div className="absolute top-4 right-16 w-10 h-10 border-2 border-yellow-400 rounded-full"></div>
        <div className="absolute bottom-12 left-24 w-8 h-8 bg-teal-200 rounded-full"></div>

        {/* Content */}
        <h1 className="text-5xl font-extrabold text-orange-500 leading-tight">
          Bài giảng
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Góc chia sẻ bài giảng điện tử là nơi đăng tải các bài giảng được xây
          dựng bởi một đội ngũ giáo viên giỏi, dày dặn kinh nghiệm với mục đích
          tạo ra một nguồn tài liệu tham khảo uy tín, phần nào hỗ trợ Quý thầy
          cô trong quá trình giảng dạy.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Grade Selection */}
        <div className="relative mb-8">
          <div className="flex overflow-x-auto scrollbar-hide bg-orange-50 rounded-lg shadow-md">
            <div
              className="bg-orange-500 text-white font-bold text-lg px-9 py-2 uppercase flex items-center"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)",
              }}
            >
              LỚP
            </div>

            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-6 py-2 whitespace-nowrap transition-colors relative ${
                  selectedGrade === grade
                    ? "text-orange-500 font-medium after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-orange-500"
                    : "hover:bg-gray-100"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Nhập tên bài giảng cần tìm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <select className="px-4 py-2 border rounded-lg appearance-none bg-white">
            <option>Chọn tuần</option>
            {Array.from({ length: 35 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tuần {i + 1}
              </option>
            ))}
          </select>
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Tìm Kiếm
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Subjects Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <h3 className="font-medium mb-4">Môn học</h3>
            <div className="space-y-3">
              {subjects.map((subject) => (
                <label key={subject.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subject.name === selectedSubject}
                    onChange={() => setSelectedSubject(subject.name)}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <span>{subject.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lessons Grid */}
          <div className="col-span-12 md:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="relative aspect-video">
                    <img
                      src={lesson.image}
                      alt={lesson.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">Tuần {lesson.week}</span>
                      </div>
                      <h3 className="text-sm font-medium leading-tight">
                        {lesson.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                        {lesson.subject}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                        {lesson.grade}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" /> {lesson.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" /> {lesson.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" /> {lesson.shares}
                        </span>
                      </div>
                      <button className="text-orange-500 hover:text-orange-600">
                        Xem nhanh
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonGrid;
