import React, { useEffect } from "react";
import "../styles/QuestionCard.css";
import { AnswerType, LifelineType, QuestionState } from "../types";
import { getFirstUsedLifeline, LIFELINES_ENUM, speak } from "../utils/utils";
const DOMPurify = require("dompurify")(window);

type QuestionCardProps = {
  timeLeft: number;
  prizeWon: string;
  quitGame: () => void;
  goToHome: () => void;
  contestantName: string;
  question: QuestionState;
  lifelines: LifelineType;
  userAnswer: AnswerType | null;
  doubleDippOptions: [string, string];
  checkAnswer: (e: React.MouseEvent<HTMLButtonElement>) => void;
  chooseLifeline: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  timeLeft,
  quitGame,
  goToHome,
  question,
  prizeWon,
  lifelines,
  userAnswer,
  checkAnswer,
  chooseLifeline,
  contestantName,
  doubleDippOptions,
}) => {
  useEffect(() => {
    if (question) {
      let modifiedQuestion = question?.question.replaceAll(/&.{4};/g, "");
      speak(modifiedQuestion);

      let modifiedOptions: string[] = [];

      question.options.map((option: string, index: number) => {
        const modifiedOption = option?.replaceAll(/&.{4};/g, "");
        modifiedOptions.push(
          `Option ${["A", "B", "C", "D"][index]}. ${modifiedOption}`.padEnd(
            1500,
            " "
          )
        );
        return null;
      });

      speak(modifiedOptions.join(""));
    }
  }, [question]);

  if (question) {
    return (
      <>
        <div>
          <h1 className="contestant__name">{contestantName}</h1>
          <button className="quit__game" onClick={quitGame}>
            Quit Game
          </button>
        </div>
        <div className="questions__container">
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
          <div className="answers_container">
            <div className="timer flex">{timeLeft}</div>
            {question?.options?.map((option: string) => (
              <button
                disabled={!!userAnswer || doubleDippOptions.includes(option)}
                style={{
                  cursor: doubleDippOptions.includes(option)
                    ? "not-allowed"
                    : "pointer",
                  filter: doubleDippOptions.includes(option)
                    ? "brightness(50%)"
                    : "pointer",
                }}
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
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(option),
                }}
              />
            ))}
          </div>
          <div className="prize__container flex">
            <span className="prize">
              You won - <strong>₹ {prizeWon}</strong>
            </span>
          </div>
          <div className="lifeline__container flex">
            <span className="lifeline__badge">Lifelines</span>
            {Object.keys(lifelines).map((key: string) => (
              <button
                key={key}
                title={key}
                value={key}
                onClick={chooseLifeline}
                className="lifeline inline-flex"
                style={{
                  filter:
                    LIFELINES_ENUM.REVIVE_LIFELINE ===
                      getFirstUsedLifeline(lifelines) &&
                    key === getFirstUsedLifeline(lifelines) &&
                    !lifelines[LIFELINES_ENUM.REVIVE_LIFELINE]
                      ? "brightness(30%)"
                      : "none",
                }}
                disabled={
                  lifelines[key as keyof LifelineType] ||
                  key === getFirstUsedLifeline(lifelines)
                }
              >
                <span
                  className={
                    lifelines[key as keyof LifelineType] ? "lifeline__used" : ""
                  }
                />
                {key}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <button onClick={goToHome} className="go__to__home">
      Go to Home
    </button>
  );
};

export default QuestionCard;
