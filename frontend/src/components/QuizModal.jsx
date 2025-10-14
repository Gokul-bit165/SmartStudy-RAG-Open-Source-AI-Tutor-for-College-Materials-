// frontend/src/components/QuizModal.jsx
import React, { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

const QuizModal = ({ quiz, onClose, onRetake }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = quiz[currentQuestionIndex];

  const handleOptionSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption === currentQuestion.answer) {
      setScore(s => s + 1);
    }

    setSelectedOption(null);

    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setShowResult(true);
    }
  };
  
  const getButtonClass = (option) => {
    if (!selectedOption) return "bg-gray-700 hover:bg-gray-600";
    if (option === currentQuestion.answer) return "bg-green-500";
    if (option === selectedOption) return "bg-red-500";
    return "bg-gray-700";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700 shadow-2xl transform scale-95 transition-transform duration-300 animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center">
            <Lightbulb className="mr-2" /> Pop Quiz!
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {showResult ? (
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h3>
            <p className="text-xl text-gray-300 mb-6">Your Score: <span className="text-green-400">{score}</span> / {quiz.length}</p>
            <button onClick={onRetake} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Generate New Quiz
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-2">Question {currentQuestionIndex + 1} of {quiz.length}</p>
            <h3 className="text-xl font-semibold text-white mb-4">{currentQuestion.question}</h3>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left p-3 rounded-md transition-all duration-300 ${getButtonClass(option)}`}
                  disabled={selectedOption !== null}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedOption && (
              <button
                onClick={handleNextQuestion}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded animate-fade-in"
              >
                {currentQuestionIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;