import { ENV_VARS, GAME_RULES } from "../utils/utils";
import "../styles/GameRules.css";

const GameRules = (): React.ReactElement => (
  <>
    <h1 className="modal__header">
      Below are the rules of <strong>{ENV_VARS.APP_NAME}</strong>
    </h1>
    <div className="rules__container">
      {GAME_RULES.map((rule: string) => (
        <h2 className="rule" key={rule}>
          {rule}
        </h2>
      ))}
    </div>
  </>
);

export default GameRules;
