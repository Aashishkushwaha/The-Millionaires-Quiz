import { useHistory } from "react-router-dom";
import { ENV_VARS, saveToLocalStorage } from "../utils/utils";

const useLogout = () => {
  const history = useHistory();

  const logout = () => {
    saveToLocalStorage(`${ENV_VARS.APP_NAME}_token`, "");
    history.push("/");
  };

  return { logout };
};

export default useLogout;
