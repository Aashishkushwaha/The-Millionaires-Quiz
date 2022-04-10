import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation, useHistory } from "react-router-dom";
import { ENV_VARS, saveToLocalStorage, showToast } from "../../utils/utils";
import "../../styles/LoginOrRegister.css";
import Loader from "../Loader";

type LoginOrRegisterProps = {
  setContestantName: (name: string) => void;
};

const LoginOrRegister: React.FC<LoginOrRegisterProps> = ({
  setContestantName,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const currentPage = location.pathname.split("/")[1];

  const resetFormFields = () => {
    setUsername("");
    setPassword("");
  };

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setContestantName(username.split("@")[0]);
      const { data } = await axios.post(
        `https://tmq-backend.herokuapp.com/auth/${currentPage}`,
        {
          username,
          password,
        }
      );
      if (currentPage === "login")
        saveToLocalStorage(`${ENV_VARS.APP_NAME}_token`, data?.token);

      showToast(data?.message, { variant: "success" });
      resetFormFields();
      setTimeout(() => {
        history.push(`/${currentPage === "register" ? "login" : "init_game"}`);
      }, 500);
    } catch (error: any) {
      if (error?.response?.data?.message)
        showToast(error?.response?.data?.message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="loginOrRegister__container">
      {loading && <Loader />}
      <div className="form-field__container">
        <div className="form-header">{currentPage}</div>
      </div>
      <div className="form-field__container">
        <input
          required
          id="username"
          type="email"
          maxLength={30}
          autoComplete="off"
          value={username}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="username">Username</label>
      </div>
      <div className="form-field__container">
        <input
          required
          id="password"
          type="password"
          minLength={6}
          autoComplete="off"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="name">Password</label>
      </div>
      <div className="form-field__container">
        <button
          type="submit"
          className="loginOrRegister__btn"
          onClick={onSubmit}
        >
          {currentPage === "login" ? "Login" : "Create Account"}
        </button>
      </div>
      <div className="link__container">
        {currentPage === "login"
          ? "Don't have an account?"
          : "Already have an account?"}
        <Link to={currentPage === "login" ? "/register" : "/login"}>
          {currentPage === "login" ? "Sign Up" : "Sign in"}
        </Link>
      </div>
    </form>
  );
};

export default LoginOrRegister;
