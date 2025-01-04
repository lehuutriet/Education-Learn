import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import {
  Star,
  Lock,
  LucideIcon,
  BookOpen,
  School,
  University,
  Brain,
} from "lucide-react";
import LessonExercise from "./LessonExercise";
import { useAuth } from "../contexts/auth/authProvider";
import { ID, Query } from "appwrite";

// Định nghĩa interface cho bài học
interface Lesson {
  id: number;
  title: string;
  icon: LucideIcon;
  color: string;
  isLocked: boolean;
  isCompleted: boolean;
  requiredLevel: number;
  stars: number;
}

// Định nghĩa initial state cho lessons
const initialLessons: Lesson[] = [
  {
    id: 1,
    title: "Cơ bản",
    icon: BookOpen,
    color: "#58CC02",
    isLocked: false,
    isCompleted: false,
    requiredLevel: 1,
    stars: 0,
  },
  {
    id: 2,
    title: "Trung cấp",
    icon: School,
    color: "#58CC02",
    isLocked: false,
    isCompleted: false,
    requiredLevel: 1,
    stars: 0,
  },
  {
    id: 3,
    title: "Nâng cao",
    icon: University,
    color: "#CE82FF",
    isLocked: false,
    isCompleted: false,
    requiredLevel: 2,
    stars: 0,
  },
  {
    id: 4,
    title: "Tổng hợp",
    icon: Brain,
    color: "#FF9600",
    isLocked: false,
    isCompleted: false,
    requiredLevel: 3,
    stars: 0,
  },
];

const LearningContent = () => {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lessonStars, setLessonStars] = useState<{ [key: number]: number }>({});

  const { databases, account } = useAuth();
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const USER_PROGRESS_COLLECTION_ID = "67651970003a2f138575";

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const user = await account.get();
        const response = await databases.listDocuments(
          DATABASE_ID,
          USER_PROGRESS_COLLECTION_ID,
          [Query.equal("userId", [user.$id])]
        );

        const progressMap: { [key: number]: number } = {};
        const completedLessons = new Set<number>();

        response.documents.forEach((doc) => {
          progressMap[doc.lessonId] = doc.stars;
          if (doc.isCompleted) {
            completedLessons.add(doc.lessonId);
          }
        });

        setLessonStars(progressMap);

        // Cập nhật trạng thái hoàn thành và mở khóa của bài học
        const updatedLessons = lessons.map((lesson) => {
          const isCompleted = completedLessons.has(lesson.id);
          // Kiểm tra nếu là bài Tổng hợp (id = 4)
          if (lesson.id === 4) {
            // Mở khóa nếu 3 bài học đầu đều đã hoàn thành
            const isUnlocked = [1, 2, 3].every((id) =>
              completedLessons.has(id)
            );
            return {
              ...lesson,
              isCompleted,
              stars: progressMap[lesson.id] || 0,
              isLocked: !isUnlocked,
            };
          }
          return {
            ...lesson,
            isCompleted,
            stars: progressMap[lesson.id] || 0,
          };
        });
        setLessons(updatedLessons);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    fetchUserProgress();
  }, []);

  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      setSelectedLesson(lesson);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
  };

  const updateLessonStars = async (
    lessonId: number,
    stars: number,
    score: number,
    timeSpent: number
  ) => {
    try {
      const user = await account.get();

      const existingProgress = await databases.listDocuments(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        [Query.equal("userId", [user.$id]), Query.equal("lessonId", [lessonId])]
      );

      const progressData = {
        userId: user.$id,
        lessonId: lessonId,
        stars: stars,
        score: score,
        timeSpent: timeSpent,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };

      if (existingProgress.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          USER_PROGRESS_COLLECTION_ID,
          existingProgress.documents[0].$id,
          progressData
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          USER_PROGRESS_COLLECTION_ID,
          ID.unique(),
          progressData
        );
      }

      // Cập nhật state local
      setLessonStars((prev) => ({
        ...prev,
        [lessonId]: stars,
      }));

      // Cập nhật lessons state
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, isCompleted: true, stars: stars }
            : lesson
        )
      );
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-8">
        {/* Thêm tiêu đề section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chọn cấp độ học tập
          </h1>
          <p className="text-gray-600">
            Hãy bắt đầu với những bài học phù hợp với trình độ của bạn
          </p>
        </div>

        {/* Grid layout thay vì stack dọc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-6">
                {/* Icon circle với style mới */}
                <div
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-transform hover:scale-105
              ${lesson.isLocked ? "bg-gray-100" : "cursor-pointer"}
            `}
                  style={{
                    backgroundColor: lesson.isLocked
                      ? undefined
                      : `${lesson.color}15`,
                  }}
                >
                  {lesson.isLocked ? (
                    <Lock className="w-8 h-8 text-gray-400" />
                  ) : (
                    <lesson.icon
                      className="w-10 h-10"
                      style={{ color: lesson.color }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {lesson.title}
                  </h3>

                  {/* Stars */}
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= (lessonStars[lesson.id] || lesson.stars)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedLesson && (
          <LessonExercise
            level={selectedLesson.title}
            lessonId={selectedLesson.id}
            onComplete={updateLessonStars}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </>
  );
};

export default LearningContent;
