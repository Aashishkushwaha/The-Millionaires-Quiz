import React, { useEffect } from "react";
import "../styles/GameSummary.css";
import { speak } from "../utils/utils";

type GameSummaryProps = {
  prizeWon: string;
  goToHome: () => void;
  questionNumber: number;
  contestantName: string;
};

const GameSummary: React.FC<GameSummaryProps> = ({
  prizeWon,
  goToHome,
  contestantName,
  questionNumber,
}) => {
  useEffect(() => {
    prizeWon &&
      speak(
        `Congratulations! ${contestantName}, You won ${prizeWon
          .split(",")
          .join("")} Rupees`
      );
  }, [contestantName, prizeWon]);

  return (
    <div className="summary__container">
      {questionNumber !== -1 && (
        <>
          <h1>Game Over</h1>

          <h2>
            Congratulations! {contestantName}, You won{" "}
            <strong> - ₹ {prizeWon}</strong>
          </h2>
        </>
      )}

      <button onClick={goToHome} className="go__to__home">
        Go to Home
      </button>
    </div>
  );
};

export default GameSummary;
