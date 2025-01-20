import { useEffect, useState } from "react";
import { Target, Brain, Rocket, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import WordGameModal from "./WordGameModal";
import MemoryGameModal from "./MemoryGameModal";
import QuizGameModal from "./QuizGameModal";
import {
  WordGameData,
  MemoryGameData,
  QuizGameData,
  DATABASE_ID,
  COLLECTIONS,
} from "../type/game";
import { useAuth } from "../contexts/auth/authProvider";
interface Game {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  subject: string;

  isLocked: boolean;
  type: "quiz" | "memory" | "puzzle" | "word";
}

const initialGames: Game[] = [
  {
    id: 1,
    title: "Ghép từ tiếng Việt",
    description: "Ghép các từ để tạo thành câu có nghĩa",
    icon: Target,
    color: "#58CC02",
    subject: "Tiếng Việt",

    isLocked: false,
    type: "word",
  },
  {
    id: 2,
    title: "Trí nhớ số học",
    description: "Ghi nhớ và ghép các phép tính đúng",
    icon: Brain,
    color: "#FF9600",
    subject: "Toán",

    isLocked: false,
    type: "memory",
  },
  {
    id: 3,
    title: "Câu đố khoa học",
    description: "Giải các câu đố về khoa học tự nhiên",
    icon: Rocket,
    color: "#CE82FF",
    subject: "Khoa học",

    isLocked: false,
    type: "quiz",
  },
];

const GameArea = () => {
  const [games] = useState<Game[]>(initialGames);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [wordGameData, setWordGameData] = useState<WordGameData[]>([]);
  const [memoryGameData, setMemoryGameData] = useState<MemoryGameData[]>([]);
  const [quizGameData, setQuizGameData] = useState<QuizGameData[]>([]);
  const { databases } = useAuth();
  const handleGameClick = (game: Game) => {
    if (!game.isLocked) {
      setSelectedGame(game);
      setShowGameModal(true);
    }
  };
  // Thêm useEffect để fetch data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.word
        );
        // Map data cho WordGame
        const wordData = response.documents.map((doc) => ({
          $id: doc.$id,
          words: doc.words,
          correctAnswer: doc.correctAnswer,
          level: doc.level,
        }));
        setWordGameData(wordData);

        const memoryResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.memory
        );
        // Map data cho MemoryGame
        const memoryData = memoryResponse.documents.map((doc) => ({
          $id: doc.$id,
          equation: doc.equation,
          answer: doc.answer,
          level: doc.level,
        }));
        setMemoryGameData(memoryData);

        const quizResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.quiz
        );
        // Map data cho QuizGame
        const quizData = quizResponse.documents.map((doc) => ({
          $id: doc.$id,
          question: doc.question,
          options: doc.options,
          correctAnswer: doc.correctAnswer,
          level: doc.level,
          category: doc.category,
        }));
        setQuizGameData(quizData);
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchGameData();
  }, [databases]); // Thêm dependencies databases

  const renderGameModal = (game: Game) => {
    switch (game.type) {
      case "word":
        return (
          <WordGameModal
            onClose={() => setShowGameModal(false)}
            gameData={wordGameData}
          />
        );
      case "memory":
        return (
          <MemoryGameModal
            onClose={() => setShowGameModal(false)}
            gameData={memoryGameData}
          />
        );
      case "quiz":
        return (
          <QuizGameModal
            onClose={() => setShowGameModal(false)}
            gameData={quizGameData}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trò chơi học tập
          </h1>
          <p className="text-lg text-gray-600">
            Học tập qua các trò chơi tương tác thú vị
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300
                ${!game.isLocked && "transform hover:-translate-y-1"}`}
            >
              <div
                onClick={() => !game.isLocked && handleGameClick(game)}
                className="cursor-pointer"
              >
                <div
                  className="h-32 flex items-center justify-center"
                  style={{
                    backgroundColor: game.isLocked
                      ? "#f3f4f6"
                      : `${game.color}15`,
                  }}
                >
                  {game.isLocked ? (
                    <Lock className="w-12 h-12 text-gray-400" />
                  ) : (
                    <game.icon
                      className="w-16 h-16"
                      style={{ color: game.color }}
                    />
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {game.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{game.description}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    {game.subject}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showGameModal && selectedGame && (
        <div className="fixed inset-0 z-50">
          {renderGameModal(selectedGame)}
        </div>
      )}
    </div>
  );
};

export default GameArea;
