import React from "react";
import { Link, Redirect } from "react-router-dom";
import "../styles/Home.css";
import { ENV_VARS, getFromLocalStorage } from "../utils/utils";

type HomeProps = {
  startGame: () => void;
  showRules: () => void;
  contestantName: string;
  logoutClickHandler: () => void;
  setContestantName: (name: string) => void;
};

const Home: React.FC<HomeProps> = ({
  startGame,
  showRules,
  contestantName,
  setContestantName,
  logoutClickHandler,
}) => {
  const token = getFromLocalStorage(`${ENV_VARS.APP_NAME}_token`);

  if (!token) return <Redirect to="/login" />;

  return (
    <div>
      {token && (
        <button className="logout__button" onClick={logoutClickHandler}>
          Logout
        </button>
      )}
      <div className="contestant__container">
        <input
          required
          id="name"
          type="text"
          maxLength={30}
          autoComplete="off"
          value={contestantName}
          className="contestant__input"
          placeholder="Contestant Name"
          onChange={(e) => setContestantName(e.target.value)}
        />
        <label htmlFor="name">Contestant Name</label>
      </div>
      <div>
        <button className="start__game" onClick={startGame}>
          Start Game
        </button>
      </div>
      <div>
        <button className="game__rules-btn" onClick={showRules}>
          Check Rules
        </button>
      </div>
      <div className="game__stats">
        <Link to="/game-stats">Check Game Stats</Link>
      </div>
    </div>
  );
};

export default Home;
