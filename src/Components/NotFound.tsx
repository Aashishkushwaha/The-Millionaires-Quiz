import React, { useEffect } from "react";
import "../styles/NotFound.css";
import { speak } from "../utils/utils";

type NotFoundProps = {
  goToHome: () => void;
  soundEnabled: boolean;
};

const NotFound: React.FC<NotFoundProps> = ({
  goToHome,
  soundEnabled,
}): React.ReactElement => {
  useEffect(() => {
    soundEnabled &&
      speak(
        `Oops... it seems you're on the wront page. Please go to home page.`
      );
  }, [soundEnabled]);

  return (
    <>
      <div className="not-found__container">
        <span className="not-found__number">4</span>
        <span className="not-found__number">0</span>
        <span className="not-found__number">4</span>
        <span className="not-found__text">
          <strong>There's NOTHING here</strong>
        </span>
      </div>
      <button onClick={goToHome} className="go__to__home">
        Go to Home
      </button>
    </>
  );
};

export default NotFound;
