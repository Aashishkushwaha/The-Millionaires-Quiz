import React from "react";
import "../styles/QuestionCard.css";
import { AnswerType, QuestionState } from "../types";
const DOMPurify = require("dompurify")(window);

type QuestionCardProps = {
  timeLeft: number;
  prizeWon: string;
  options: string[];
  quitGame: () => void;
  goToHome: () => void;
  checkAnswer: (e: React.MouseEvent<HTMLButtonElement>) => void;
  userAnswer: AnswerType | null;
  contestantName: string;
  question: QuestionState;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  contestantName,
  question,
  options,
  timeLeft,
  checkAnswer,
  userAnswer,
  prizeWon,
  quitGame,
  goToHome,
}) => {
  return (
    <>
      {question && (
        <>
          <h1 className="contestant__name">{contestantName}</h1>
          <button className="quit__game" onClick={quitGame}>
            Quit Game
          </button>
        </>
      )}
      <div className="questions__container">
        {question && (
          <>
            <span className="question__prize">
              <strong>₹ {question?.questionPrize}</strong>
            </span>
            <h2
              className="question"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  `Q${question.questionNo + 1}. ${question?.question}`
                ),
              }}
            />
          </>
        )}
        <div className="answers_container">
          {question && <div className="timer flex">{timeLeft}</div>}
          {options?.map((option: string) => (
            <button
              disabled={!!userAnswer}
              // style={{
              //   background:
              //     userAnswer?.correct_answer === option
              //       ? "#4a9428"
              //       : userAnswer?.answer === option && userAnswer?.correct
              //       ? "#4a9428"
              //       : userAnswer?.answer === option && !userAnswer?.correct
              //       ? "#f84f50"
              //       : "#fff",
              // }}
              className={
                userAnswer?.correct_answer === option ||
                (userAnswer?.answer === option && userAnswer?.correct)
                  ? "correct__answer"
                  : userAnswer?.answer === option && !userAnswer?.correct
                  ? "wrong__answer"
                  : "not__answered"
              }
              onClick={checkAnswer}
              key={option}
              value={option}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option) }}
            />
          ))}
        </div>
        {question && (
          <div className="prize__container flex">
            <span className="prize">
              You won - <strong>₹ {prizeWon}</strong>
            </span>
          </div>
        )}
        {!question && (
          <button onClick={goToHome} className="go__to__home">
            Go to Home
          </button>
        )}
      </div>
    </>
  );
};

export default QuestionCard;
