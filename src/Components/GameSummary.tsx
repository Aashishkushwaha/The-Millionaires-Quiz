import axios from "axios";
import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import {
  ENV_VARS,
  getFromLocalStorage,
  showToast,
  speak,
} from "../utils/utils";
import "../styles/GameSummary.css";

type GameSummaryProps = {
  prizeWon: string;
  goToHome: () => void;
  questionNumber: number;
  contestantName: string;
  logoutClickHandler: () => void;
};

const GameSummary: React.FC<GameSummaryProps> = ({
  prizeWon,
  goToHome,
  contestantName,
  questionNumber,
  logoutClickHandler,
}) => {
  const token = getFromLocalStorage(`${ENV_VARS.APP_NAME}_token`);
  const { logout } = useLogout();

  useEffect(() => {
    const saveDetails = async () => {
      try {
        const { data } = await axios.post(
          "https://tmq-backend.herokuapp.com/game/submitStats",
          {
            contestantName,
            prizeEarned: prizeWon.split(",").join(""),
            time: new Date(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        showToast(data?.message);
      } catch (error: any) {
        if (error?.response?.data?.code === 401) showToast("Session expired!");
        logout();
      }
    };

    if (token && prizeWon) saveDetails();

    prizeWon &&
      speak(
        `${
          +prizeWon === 0 ? "Tough luck" : "Congratulations!"
        } ${contestantName}, You won ${prizeWon.split(",").join("")} Rupees`
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestantName, prizeWon, token]);

  if (!token) return <Redirect to="/login" />;

  return (
    <div className="summary__container">
      {token && (
        <button className="logout__button" onClick={logoutClickHandler}>
          Logout
        </button>
      )}
      {questionNumber !== -1 && (
        <>
          <h1>Game Over</h1>

          <h2>
            {+prizeWon === 0 ? "Tough luck!" : "Congratulations!"}{" "}
            {contestantName}, You won <strong> - ₹ {prizeWon}</strong>
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
