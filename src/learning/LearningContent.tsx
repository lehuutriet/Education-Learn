import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import {
  Star,
  Lock,
  LucideIcon,
  CircleCheck,
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
        <div className="space-y-12">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="relative">
              {/* Connector Line */}
              {index < lessons.length - 1 && (
                <div className="absolute left-1/2 top-28 -translate-x-1/2 w-1 h-16 bg-gray-200" />
              )}

              {/* Lesson Card */}
              <div
                className={`relative z-10 flex flex-col items-center ${
                  lesson.isLocked ? "opacity-75" : ""
                }`}
              >
                {/* Icon Circle */}
                <div
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 
                    ${
                      lesson.isLocked
                        ? "bg-gray-200"
                        : "cursor-pointer shadow-lg"
                    }`}
                  style={{
                    backgroundColor: lesson.isLocked
                      ? undefined
                      : `${lesson.color}20`,
                  }}
                >
                  {lesson.isLocked ? (
                    <Lock className="w-10 h-10 text-gray-400" />
                  ) : (
                    <lesson.icon
                      className="w-12 h-12"
                      style={{ color: lesson.color }}
                    />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {lesson.title}
                </h3>

                {/* Level Requirement */}
                {lesson.isLocked && (
                  <span className="text-sm text-gray-500 mb-2">
                    Yêu cầu vượt qua {lesson.requiredLevel} cấp độ
                  </span>
                )}

                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= (lessonStars[lesson.id] || lesson.stars)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Completion Status */}
                {lesson.isCompleted && (
                  <div className="absolute -top-2 -right-2">
                    <CircleCheck className="w-8 h-8 text-green-500 fill-white" />
                  </div>
                )}
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
