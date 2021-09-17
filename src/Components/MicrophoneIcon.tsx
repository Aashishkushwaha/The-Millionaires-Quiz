import React from "react";
import "../styles/MicrophoneIcon.css";

type MicrophoneIconProps = {
  enabled: boolean;
  toggle: () => void;
};

const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({ enabled, toggle }) => {
  return (
    <button
      onClick={toggle}
      className="icon__container"
      aria-label="toggle microphone"
    >
      <span className="microphone__part-1"></span>
      <span className="microphone__part-2"></span>
      <span className="microphone__line microphone__line-1"></span>
      <span className="microphone__line microphone__line-2"></span>
      <span className={`close ${!enabled ? "show" : "hide"}`}></span>
    </button>
  );
};

export default MicrophoneIcon;
