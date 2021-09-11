import React, { useState, useEffect } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import {
  getFirstUsedLifeline,
  getQuestionsByDifficulty,
  INITIAL_STATE,
  LIFELINES_ENUM,
  shuffleArr,
} from "./utils/utils";
import { QuestionState, QuestionType, AnswerType, LifelineType } from "./types";
import { useAxios } from "./hooks/useAxios";
import {
  Home,
  Modal,
  Loader,
  GameRules,
  GameSummary,
  QuestionCard,
} from "./Components";

const TOTAL_QUESTIONS: number = +process.env.REACT_APP_TOTAL_QUESTIONS!;
const APP_NAME: string = process.env.REACT_APP_APP_NAME!;
const QUESTION_PRIZES: string[] =
  process.env.REACT_APP_QUESTION_PRIZES?.split(";")!;

const App = () => {
  const history = useHistory();
  const [lifelines, setLifeLines] = useState<LifelineType>(
    INITIAL_STATE.LIFELINES
  );
  const [doubleDippOptions, setDoubleDippOptions] = useState<[string, string]>([
    "",
    "",
  ]);
  const [contestantName, setContestantName] = useState<string>("");
  const [selectedLifelineForRevival, setSelectedLifelineForRevival] =
    useState<string>("");
  const [selectedLifeline, setSelectedLifeline] = useState<string>("");
  const [showRules, setShowRules] = useState<boolean>(false);
  const [wantToQuitGame, setWantToQuitGame] = useState<boolean>(false);
  const [showContestentError, setShowContestentError] =
    useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(45);
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [questionNumber, setQuestionNumber] = useState<number>(-1);
  const [gameOver, setGameOver] = useState<boolean>(true);
  const [prizeWon, setPrizeWon] = useState<string>("0");
  const [loadingNextQuestion, setLoadingNextQuestion] =
    useState<boolean>(false);
  const [timerId, setTimerId] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<AnswerType[]>([]);

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
      setLifeLines(INITIAL_STATE.LIFELINES);
      history.push("/summary");
    }, 1000);
  };

  const chooseLifeline = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedLifeline(e.currentTarget.value);
  };

  const ReviveLifelineConfirmHandler = () => {
    setLifeLines({
      ...lifelines,
      [LIFELINES_ENUM.REVIVE_LIFELINE]: true,
      [selectedLifelineForRevival]: false,
    });
    setTimeout(() => {
      setSelectedLifelineForRevival("");
      setSelectedLifeline("");
    }, 400);
  };

  const lifelineConfirmHandler = () => {
    if (selectedLifeline === LIFELINES_ENUM.REVIVE_LIFELINE) {
      setTimeout(
        () => setSelectedLifelineForRevival(getFirstUsedLifeline(lifelines)),
        500
      );
      return;
    }

    setLifeLines({
      ...lifelines,
      [selectedLifeline]: true,
    });

    switch (selectedLifeline) {
      case LIFELINES_ENUM.DOUBLE_DIPP:
        clearInterval(timerId);
        let [option1, option2] = shuffleArr(
          questions[questionNumber].incorrect_answers
        ).slice(0, 2);
        setDoubleDippOptions([option1, option2]);
        setTimeout(() => {
          let id = setInterval(tick, 1000);
          setTimerId(id);
        }, 1000);
    }
    setSelectedLifeline("");
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

  const goToHome = () => {
    history.push("/");
  };

  const quitGame = () => {
    setWantToQuitGame(true);
  };

  const changeRevivalLifeline = (selectedRevivalLifeline: string) => {
    setSelectedLifelineForRevival(selectedRevivalLifeline);
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
    window.onbeforeunload = function () {
      return "Are you sure you want to leave?";
    };
  }, []);

  useEffect(() => {
    if (questionNumber > -1) {
      setSeconds(questionNumber > 9 ? 90 : questionNumber > 4 ? 60 : 45);
      setDoubleDippOptions(["", ""]);
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
      setWantToQuitGame(false);
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

      <Modal
        type={
          ["Audience Poll", "Double Dipp", "Expert Advice"].includes(
            selectedLifelineForRevival
          )
            ? "info"
            : "confirm"
        }
        show={!!selectedLifeline}
        confirmHandler={lifelineConfirmHandler}
        cancelHandler={() => setSelectedLifeline("")}
        closeHandler={
          selectedLifelineForRevival
            ? ReviveLifelineConfirmHandler
            : () => setSelectedLifeline("")
        }
      >
        {selectedLifelineForRevival ? (
          <div className="lineline__revival__container">
            <h3 style={{ marginBottom: "1rem" }}>
              Please Select lifeline to revive
            </h3>
            {[
              {
                id: "audiencePoll",
                key: LIFELINES_ENUM.AUDIENCE_POLL,
              },
              {
                id: "doubleDipp",
                key: LIFELINES_ENUM.DOUBLE_DIPP,
              },
              {
                id: "expertAdvice",
                key: LIFELINES_ENUM.EXPERT_ADVICE,
              },
            ].map(({ key, id }) => (
              <React.Fragment key={key}>
                {lifelines[key as keyof LifelineType] && (
                  <div>
                    <input
                      id={id}
                      type="radio"
                      name="revivalLifeline"
                      value={selectedLifelineForRevival}
                      onChange={() => changeRevivalLifeline(key)}
                      checked={selectedLifelineForRevival === key}
                    />
                    <label htmlFor={id}>{key}</label>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <h1>
            Are you sure you want to use {`'${selectedLifeline}'`} lifeline?
          </h1>
        )}
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
            timeLeft={seconds}
            goToHome={goToHome}
            prizeWon={prizeWon}
            quitGame={quitGame}
            lifelines={lifelines}
            checkAnswer={checkAnswer}
            chooseLifeline={chooseLifeline}
            contestantName={contestantName}
            question={questions[questionNumber]}
            doubleDippOptions={doubleDippOptions}
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
