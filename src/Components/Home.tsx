import React from "react";
import "../styles/Home.css";

type HomeProps = {
  startGame: () => void;
  showRules: () => void;
  contestantName: string;
  setContestantName: (name: string) => void;
};

const Home: React.FC<HomeProps> = ({
  startGame,
  showRules,
  contestantName,
  setContestantName,
}) => {
  return (
    <div>
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
    </div>
  );
};

export default Home;
