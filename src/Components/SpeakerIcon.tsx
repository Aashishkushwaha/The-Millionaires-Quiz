import React from "react";
import "../styles/SpeakerIcon.css";

type SpeakerIconProps = {
  enabled: boolean;
  toggle: () => void;
};

const SpeakerIcon: React.FC<SpeakerIconProps> = ({ enabled, toggle }) => {
  return (
    <button className="icon__container" onClick={toggle}>
      <span className="speaker__part-1"></span>
      <span className="speaker__part-2"></span>
      <span className="speaker__line speaker__line-1"></span>
      <span className="speaker__line speaker__line-2"></span>
      <span className="speaker__line speaker__line-3"></span>
      <span
        className={`close ${!enabled ? "icon__show" : "icon__hide"}`}
      ></span>
    </button>
  );
};

export default SpeakerIcon;
