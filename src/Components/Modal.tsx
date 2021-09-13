import React, { useEffect } from "react";
import "../styles/Modal.css";
import { cancelSpeak } from "../utils/utils";

type ModalProps = {
  show: boolean;
  children?: any;
  closeHandler: () => void;
  cancelHandler?: () => void;
  confirmHandler?: () => void;
  type?: "confirm" | "info" | "default";
};

const Modal: React.FC<ModalProps> = ({
  show = false,
  closeHandler,
  cancelHandler,
  confirmHandler,
  type = "default",
  children = <h1>This is default modal.</h1>,
}) => {
  useEffect(() => {
    if (show) {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [show]);

  const handler = (cb: Function | undefined): void => {
    cancelSpeak();
    cb && cb();
  };

  return (
    <>
      <div
        className={`backdrop ${show ? "show__backdrop" : "hide__backdrop"}`}
        onClick={() => handler(closeHandler)}
      />
      <div
        className={`modal__container ${show ? "show__modal" : "hide__modal"}`}
      >
        {type !== "info" && (
          <button
            tabIndex={!show ? -1 : 0}
            className="modal__close-btn flex"
            onClick={() => handler(closeHandler)}
          >
            &times;
          </button>
        )}
        <>{children}</>
        {type !== "default" && (
          <div className="flex">
            {type === "confirm" ? (
              <>
                <button
                  tabIndex={!show ? -1 : 0}
                  className="confirm__btn"
                  onClick={() => handler(confirmHandler)}
                >
                  Confirm
                </button>
                <button
                  tabIndex={!show ? -1 : 0}
                  className="cancel__btn"
                  onClick={() => handler(cancelHandler)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                tabIndex={!show ? -1 : 0}
                className="info__button"
                onClick={() => handler(closeHandler)}
              >
                Okay
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Modal;
