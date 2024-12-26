import { useEffect, useState } from "react";
import { Download, Eye, MoveLeft, Play, Search } from "lucide-react";
import { Query } from "appwrite";
import { useAuth } from "../contexts/auth/authProvider";
import pptxgen from "pptxgenjs"; // Add this import at the top

import SlideThumbnails from "./SlideThumbnails";
import SlidePreview from "./SlidePreview";
import PresentationMode from "../components/PresentationMode";

interface Slide {
  id: string;
  type: "cover" | "content" | "image" | "video";
  title?: string;
  content?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  order?: number;
}
interface FullScreenModalProps {
  lesson: Lecture | null;
  onClose: () => void;
}

interface Lecture {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  thumbnailUrl?: string | null;
  slides: Slide[];
  createdAt: string;
  status: "draft" | "published";
}

// Thêm component FullScreenModal
const FullScreenModal: React.FC<FullScreenModalProps> = ({
  lesson,
  onClose,
}) => {
  if (!lesson) return null;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false); // Thêm state này

  const handleDownload = async (lecture: Lecture): Promise<void> => {
    try {
      const pptx = new pptxgen();

      // Set presentation properties
      pptx.author = "Education Learn";
      pptx.title = lecture.title;

      // Convert slides to PowerPoint
      for (const slide of lecture.slides) {
        const pptSlide = pptx.addSlide();

        // Add title if exists
        if (slide.title) {
          pptSlide.addText(slide.title, {
            x: 0.5,
            y: 0.5,
            w: "90%",
            fontSize: 24,
            bold: true,
          });
        }

        switch (slide.type) {
          case "content":
            // Add content text
            if (slide.content) {
              pptSlide.addText(slide.content, {
                x: 0.5,
                y: slide.title ? 1.5 : 0.5,
                w: "90%",
                fontSize: 18,
                bullet: true,
              });
            }
            break;

          case "image":
            // Add image
            if (slide.imageUrl) {
              try {
                // Convert image URL to base64
                const response = await fetch(slide.imageUrl);
                const blob = await response.blob();
                const reader = new FileReader();

                await new Promise((resolve) => {
                  reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                      pptSlide.addImage({
                        data: reader.result,
                        x: 0.5,
                        y: slide.title ? 1.5 : 0.5,
                        w: "90%",
                        h: "70%",
                      });
                    }
                    resolve(null);
                  };
                  reader.readAsDataURL(blob);
                });
              } catch (error) {
                console.error("Error adding image to slide:", error);
              }
            }
            break;
        }
      }

      // Save the PowerPoint file
      await pptx.writeFile({ fileName: `${lecture.title}.pptx` });
    } catch (error) {
      console.error("Error creating PowerPoint:", error);
    }
  };

  const startPresentation = () => {
    setIsPresentationMode(true);
    document.documentElement.requestFullscreen().catch(console.error);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="h-screen w-full flex flex-col">
          {/* Header */}
          <div className="h-16 bg-gray-800 flex items-center px-4 justify-between text-white">
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="flex items-center hover:text-gray-300"
              >
                <MoveLeft className="w-5 h-5 mr-2" />
              </button>
              <h1 className="text-3xl font-bold text-900">{lesson.title}</h1>
            </div>
            <h1>
              Slide {currentSlide + 1}/{lesson.slides.length}
            </h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={startPresentation}
                  className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Trình chiếu
                </button>
                <button
                  onClick={() => handleDownload(lesson)}
                  className="px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Tải xuống
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex">
            {/* Main content */}
            <div className="flex flex-1">
              {/* Sidebar */}
              <div className="w-64 bg-gray-800">
                <SlideThumbnails
                  slides={lesson.slides}
                  currentSlide={currentSlide}
                  onSlideClick={setCurrentSlide}
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 bg-white flex flex-col">
                <SlidePreview slide={lesson.slides[currentSlide]} />
                {/* Navigation controls */}
                <div className="h-16 border-t flex items-center justify-between px-8">
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentSlide === 0}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
                  >
                    Slide trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) =>
                        Math.min(lesson.slides.length - 1, prev + 1)
                      )
                    }
                    disabled={currentSlide === lesson.slides.length - 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
                  >
                    Slide tiếp theo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thêm PresentationMode */}
      {isPresentationMode && (
        <PresentationMode
          slides={lesson.slides}
          onClose={() => {
            setIsPresentationMode(false);
            document.exitFullscreen().catch(console.error);
          }}
        />
      )}
    </>
  );
};

// Component hiển thị chi tiết bài học

// Component hiển thị danh sách bài học
const LessonList = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);

  const [quickViewLesson, setQuickViewLesson] = useState<Lecture | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const { storage, databases } = useAuth();
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const LECTURES_COLLECTION_ID = "6768c2bc003540d2819a";
  const SLIDES_COLLECTION_ID = "6768c2d20028b42e6942";
  const BUCKET_Lectures = "6768c2e9001eabc5618f";
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const grades = [
    { id: 0, name: "Tất cả" },
    { id: 1, name: "Lớp 1" },
    { id: 2, name: "Lớp 2" },
    { id: 3, name: "Lớp 3" },
    { id: 4, name: "Lớp 4" },
    { id: 5, name: "Lớp 5" },
    { id: 6, name: "Lớp 6" },
    { id: 7, name: "Lớp 7" },
    { id: 8, name: "Lớp 8" },
    { id: 9, name: "Lớp 9" },
    { id: 10, name: "Lớp 10" },
    { id: 11, name: "Lớp 11" },
    { id: 12, name: "Lớp 12" },
  ];

  const fetchLectures = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LECTURES_COLLECTION_ID
      );

      // Xử lý lấy thông tin lectures và slides
      const lecturesWithSlides = await Promise.all(
        response.documents.map(async (lecture) => {
          // Fetch slides cho mỗi lecture
          const slidesResponse = await databases.listDocuments(
            DATABASE_ID,
            SLIDES_COLLECTION_ID,
            [Query.equal("lectureId", [lecture.$id])]
          );

          // Xử lý file URLs cho mỗi slide
          const slides = await Promise.all(
            slidesResponse.documents.map(async (slide) => {
              let fileUrl = null;
              if (slide.fileId) {
                fileUrl = storage.getFilePreview(BUCKET_Lectures, slide.fileId);
              }

              return {
                id: slide.$id,
                type: slide.type,
                title: slide.title,
                content: slide.content,
                imageUrl: slide.type === "image" ? fileUrl : null,

                order: slide.order,
              };
            })
          );

          // Lấy URL thumbnail nếu có
          let thumbnailUrl = null;
          if (lecture.thumbnailFileId) {
            thumbnailUrl = storage
              .getFileView(BUCKET_Lectures, lecture.thumbnailFileId)
              .toString();
          }

          return {
            id: lecture.$id,
            title: lecture.title,
            subject: lecture.subject,
            grade: lecture.grade,
            description: lecture.description,
            thumbnailUrl,
            slides: slides.sort((a, b) => (a.order || 0) - (b.order || 0)),
            createdAt: lecture.createdAt,
            status: lecture.status,
          };
        })
      );

      setLectures(lecturesWithSlides);
    } catch (error) {
      console.error("Error fetching lectures:", error);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const filteredLectures = lectures.filter((lecture) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = lecture.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Lọc theo môn học
    const matchesSubject =
      selectedSubject === "Tất cả" || lecture.subject === selectedSubject;

    // Lọc theo lớp
    const matchesGrade =
      selectedGrade === 0 || lecture.grade === `Lớp ${selectedGrade}`;

    return matchesSearch && matchesSubject && matchesGrade;
  });

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 sm:p-8">
        {" "}
        {/* Giảm padding trên mobile */}
        <div className="mb-4 sm:mb-8">
          {/* Header */}
          <div className="bg-orange-500 px-4 py-2">
            <span className="text-white font-bold">LỚP</span>
          </div>
          {/* Grade navigation */}

          <div className="bg-white shadow-sm rounded-b-lg">
            {/* Desktop view */}
            <div className="hidden md:flex overflow-x-auto">
              <div className="flex min-w-max">
                {grades.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => setSelectedGrade(grade.id)}
                    className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors
            ${
              selectedGrade === grade.id
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
                  >
                    {grade.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile view */}
            <div className="md:hidden p-2">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Subject filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Toán">Toán</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Ngôn ngữ kí hiệu">Ngôn ngữ kí hiệu</option>
            </select>
          </div>

          {/* Search input */}

          <div className="w-full relative">
            <input
              type="text"
              placeholder="Nhập tên bài giảng cần tìm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <img
                src={lecture.thumbnailUrl || "/api/placeholder/400/200"}
                alt=""
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{lecture.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-4 text-sm px-2 py-1 rounded-full bg-green-100">
                    {lecture.subject}
                  </span>
                  <span className="mr-4 text-sm px-2 py-1 rounded-full bg-blue-100">
                    {lecture.grade}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setQuickViewLesson(lecture)}
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
      </div>
      <FullScreenModal
        lesson={quickViewLesson}
        onClose={() => setQuickViewLesson(null)}
      />
      {isPresentationMode && quickViewLesson && (
        <PresentationMode
          slides={quickViewLesson.slides}
          onClose={() => {
            setIsPresentationMode(false);
            document.exitFullscreen().catch(console.error);
          }}
        />
      )}
    </div>
  );
};

export default LessonList;
