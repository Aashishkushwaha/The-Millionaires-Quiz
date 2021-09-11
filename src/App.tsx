import React, { useState, useEffect } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import Home from "./Components/Home";
import Modal from "./Components/Modal";
import Loader from "./Components/Loader";
import GameSummary from "./Components/GameSummary";
import GameRules from "./Components/GameRules";
import QuestionCard from "./Components/QuestionCard";
import { getQuestionsByDifficulty, shuffleArr } from "./utils/utils";
import { QuestionState, QuestionType, AnswerType } from "./types";
import { useAxios } from "./hooks/useAxios";

const TOTAL_QUESTIONS: number = +process.env.REACT_APP_TOTAL_QUESTIONS!;
const APP_NAME: string = process.env.REACT_APP_APP_NAME!;
const QUESTION_PRIZES: string[] =
  process.env.REACT_APP_QUESTION_PRIZES?.split(";")!;

const App = () => {
  const [contestantName, setContestantName] = useState<string>("Aashish");
  const [showRules, setShowRules] = useState<boolean>(false);
  const [wantToQuitGame, setWantToQuitGame] = useState<boolean>(false);
  const [showContestentError, setShowContestentError] =
    useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(-45);
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [questionNumber, setQuestionNumber] = useState<number>(-1);
  const [gameOver, setGameOver] = useState<boolean>(true);
  const [prizeWon, setPrizeWon] = useState<string>("0");
  const [loadingNextQuestion, setLoadingNextQuestion] =
    useState<boolean>(false);
  const [timerId, setTimerId] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<AnswerType[]>([]);

  const history = useHistory();

  const { fetchData, data, loading, error } = useAxios();

  const tick = () => {
    setSeconds((s) => s - 1);
  };

  const startTimer = () => {
    const id = setInterval(tick, 1000);
    setTimerId(id);
  };

  const showRulesMethod = () => {
    setShowRules(true);
  };

  const gameOverMethod = () => {
    setTimeout(() => {
      setTimerId(null);
      setGameOver(true);
      history.push("/summary");
    }, 1000);
  };

  const startGame = async () => {
    if (!contestantName) {
      return setShowContestentError(true);
    }
    if (timerId) return;
    await fetchData({
      url: process.env.REACT_APP_BASE_URL,
    });
    setGameOver(false);
    setPrizeWon("0");
    setUserAnswers([]);
    setQuestionNumber(0);
    setSeconds(45);
    startTimer();
    history.push("/play");
  };

  const gameQuitConfirmHandler = () => {
    clearInterval(timerId);
    const answer: AnswerType = {
      correct: false,
      answer: "",
      correct_answer: questions[questionNumber].correct_answer,
      question: questions[questionNumber].question,
    };
    setUserAnswers((answers) => [...answers, answer]);
    setWantToQuitGame(false);
    setTimeout(() => gameOverMethod(), 1000);
  };

  const quitGame = () => {
    setWantToQuitGame(true);
  };

  const goToHome = () => {
    history.push("/");
  };

  const checkAnswer = (e: React.MouseEvent<HTMLButtonElement>) => {
    const answer = e.currentTarget.value;

    const correct = questions[questionNumber].correct_answer === answer;

    const userAnswer: AnswerType = {
      question: questions[questionNumber].question,
      correct,
      answer,
      correct_answer: questions[questionNumber].correct_answer,
    };

    clearInterval(timerId);
    setUserAnswers((answers) => [...answers, userAnswer]);
    setTimerId(null);

    if (correct) {
      setPrizeWon(questions[questionNumber].questionPrize);
      setLoadingNextQuestion(true);
      setTimeout(() => {
        setLoadingNextQuestion(false);
        setQuestionNumber((q) => q + 1);
      }, 3000);
    } else {
      gameOverMethod();
    }
  };

  useEffect(() => {
    if (questionNumber > -1) {
      setSeconds(questionNumber > 9 ? 90 : questionNumber > 4 ? 60 : 45);
      startTimer();
    }
  }, [questionNumber]);

  useEffect(() => {
    if (seconds === 0) {
      clearInterval(timerId);
      let answer: AnswerType = {
        correct: false,
        answer: "",
        correct_answer: questions[questionNumber].correct_answer,
        question: questions[questionNumber].question,
      };
      setUserAnswers((answers) => [...answers, answer]);
      setTimeout(() => gameOverMethod(), 1000);
    }
  }, [seconds]);

  useEffect(() => {
    return () => {
      clearInterval(timerId);
    };
  }, [timerId]);

  useEffect(() => {
    if (data) {
      let newData: QuestionState[] = data?.map((el: QuestionType) => {
        return {
          ...el,
          questionNo: 0,
          questionPrize: 0,
          options: shuffleArr([...el.incorrect_answers, el.correct_answer]),
        };
      });

      let questionsByDifficulty: QuestionState[] =
        getQuestionsByDifficulty(newData);
      let formattedQuestions: QuestionState[] = questionsByDifficulty.map(
        (el: QuestionState, index: number) => {
          return {
            ...el,
            questionNo: index,
            questionPrize: QUESTION_PRIZES[index],
          };
        }
      );

      setQuestions(formattedQuestions);
    }
  }, [data]);

  if (error) return <div>Some Error Occurred</div>;

  return (
    <div className="App">
      <img
        width={260}
        height={146}
        draggable={false}
        src={process.env.REACT_APP_BRAND_LOGO_WEBP}
        alt={APP_NAME}
      />
      {gameOver && <h1 className="brand">{APP_NAME}</h1>}

      {/* show loader while game is laoding or next question is loading */}
      {(loading || loadingNextQuestion) && <Loader />}

      <Modal
        type={wantToQuitGame ? "confirm" : showRules ? "info" : "default"}
        confirmHandler={wantToQuitGame ? gameQuitConfirmHandler : () => {}}
        cancelHandler={
          wantToQuitGame ? () => setWantToQuitGame(false) : () => {}
        }
        show={showRules || showContestentError || wantToQuitGame}
        closeHandler={
          showRules
            ? () => setShowRules(false)
            : wantToQuitGame
            ? () => setWantToQuitGame(false)
            : () => setShowContestentError(false)
        }
      >
        {showRules && <GameRules />}
        {showContestentError && <h1>Please Provide Contestent Name!</h1>}
        {wantToQuitGame && <h1>Are you sure you want to quit?</h1>}
      </Modal>

      <Switch>
        <Route path="/" exact>
          <Home
            showRules={showRulesMethod}
            startGame={startGame}
            contestantName={contestantName}
            setContestantName={setContestantName}
          />
        </Route>
        <Route path="/play">
          <QuestionCard
            goToHome={goToHome}
            timeLeft={seconds}
            prizeWon={prizeWon}
            quitGame={quitGame}
            checkAnswer={checkAnswer}
            contestantName={contestantName}
            question={questions[questionNumber]}
            options={questions[questionNumber]?.options}
            userAnswer={userAnswers ? userAnswers[questionNumber] : null}
          />
        </Route>
        <Route path="/summary">
          <>
            {(gameOver || questionNumber === +TOTAL_QUESTIONS!) && (
              <GameSummary
                goToHome={goToHome}
                prizeWon={prizeWon}
                questionNumber={questionNumber}
                contestantName={contestantName}
              />
            )}
          </>
        </Route>
      </Switch>
    </div>
  );
};

export default App;
