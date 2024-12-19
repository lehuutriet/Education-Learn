import { useState } from "react";
import Modal from "../components/Modal";

import {
  Star,
  Lock,
  LucideIcon,
  CircleCheck,
  BookOpen,
  School,
  Mic,
  Brain,
} from "lucide-react";
import LessonExercise from "./LessonExercise";
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

const lessons: Lesson[] = [
  {
    id: 1,
    title: "Cơ bản 1",
    icon: BookOpen,
    color: "#58CC02",
    isLocked: false,
    isCompleted: true,
    requiredLevel: 1,
    stars: 3,
  },
  {
    id: 2,
    title: "Cơ bản 2",
    icon: School,
    color: "#58CC02",
    isLocked: false,
    isCompleted: true,
    requiredLevel: 1,
    stars: 2,
  },
  {
    id: 3,
    title: "Phát âm",
    icon: Mic,
    color: "#CE82FF",
    isLocked: false,
    isCompleted: false,
    requiredLevel: 2,
    stars: 0,
  },
  {
    id: 4,
    title: "Từ vựng",
    icon: Brain,
    color: "#FF9600",
    isLocked: true,
    isCompleted: false,
    requiredLevel: 3,
    stars: 0,
  },
];

const LearningContent = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                    Yêu cầu cấp độ {lesson.requiredLevel}
                  </span>
                )}

                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= lesson.stars
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
        {selectedLesson && <LessonExercise />}
      </Modal>

      {/* Progress Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Tiến độ khóa học</span>
            <span className="font-medium">2/4 bài học</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: "50%" }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningContent;
