import React from "react";
import "../styles/NotFound.css";

type NotFoundProps = {
  goToHome: () => void;
};

const NotFound: React.FC<NotFoundProps> = ({
  goToHome,
}): React.ReactElement => {
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
