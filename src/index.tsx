import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import dotenv from "dotenv";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import {
  ENV_VARS,
  getFromLocalStorage,
  initializeTextToSpeech,
  saveToLocalStorage,
} from "./utils/utils";

dotenv.config();

initializeTextToSpeech();

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
