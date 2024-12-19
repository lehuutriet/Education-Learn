import React, { useState } from "react";
import { Heart, Circle } from "lucide-react";

interface Question {
  type: "select" | "translate";
  prompt: string;
  options?: string[];
  answer: string;
}

const questions: Question[] = [
  {
    type: "select",
    prompt: 'Which one means "apple"?',
    options: ["táo", "cam", "chuối"],
    answer: "táo",
  },
  {
    type: "translate",
    prompt: 'Translate: "Hello, how are you?"',
    answer: "Xin chào, bạn khỏe không?",
  },
];

const LessonExercise: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [lives, setLives] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswer = () => {
    const correct = selected === questions[currentQuestion].answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      setLives(lives - 1);
    }

    setTimeout(() => {
      setShowFeedback(false);
      if (correct && currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelected("");
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar and Lives */}
      <div className="fixed top-0 left-0 right-0 bg-white p-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="w-full mr-4">
            <div className="h-3 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(lives)].map((_, i) => (
              <Heart key={i} className="w-6 h-6 fill-red-500 text-red-500" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 mt-20 max-w-3xl mx-auto w-full px-4">
        <div className="text-2xl font-bold mb-8 text-center">
          {questions[currentQuestion].prompt}
        </div>

        {questions[currentQuestion].type === "select" && (
          <div className="grid grid-cols-1 gap-4">
            {questions[currentQuestion].options?.map((option) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`p-4 text-lg rounded-xl border-2 transition-all
                  ${
                    selected === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Circle
                    className={`w-5 h-5 ${
                      selected === option ? "text-blue-500" : "text-gray-400"
                    }`}
                    fill={selected === option ? "currentColor" : "none"}
                  />
                  {option}
                </div>
              </button>
            ))}
          </div>
        )}

        {questions[currentQuestion].type === "translate" && (
          <input
            type="text"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full p-4 text-lg border-2 rounded-xl focus:border-blue-500 outline-none"
            placeholder="Type your answer..."
          />
        )}
      </div>

      {/* Check Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleAnswer}
            disabled={!selected || showFeedback}
            className={`w-full p-4 rounded-xl text-white text-xl font-bold transition-all
              ${!selected ? "bg-gray-300" : "bg-green-500 hover:bg-green-600"}`}
          >
            Check
          </button>
        </div>
      </div>

      {/* Feedback Overlay */}
      {showFeedback && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black`}
        >
          <div
            className={`text-4xl font-bold p-8 rounded-2xl ${
              isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isCorrect ? "Correct! 🎉" : "Incorrect 😢"}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonExercise;
