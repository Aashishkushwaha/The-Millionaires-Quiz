import React from "react";
import "../styles/SpeakerIcon.css";

type SpeakerIconProps = {
  enabled: boolean;
  toggle: () => void;
};

const SpeakerIcon: React.FC<SpeakerIconProps> = ({ enabled, toggle }) => {
  return (
    <button className="container" onClick={toggle}>
      <span className="part-1"></span>
      <span className="part-2"></span>
      <span className="line line-1"></span>
      <span className="line line-2"></span>
      <span className="line line-3"></span>
      <span className={`close ${!enabled ? "show" : "hide"}`}></span>
    </button>
  );
};

export default SpeakerIcon;
