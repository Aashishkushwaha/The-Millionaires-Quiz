import React, { useState, useEffect } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import {
  ENV_VARS,
  GAME_STEPS,
  getFirstUsedLifeline,
  getQuestionsByDifficulty,
  INITIAL_STATE,
  LIFELINES_ENUM,
  QUESTION_TIME,
  shuffleArr,
  availableLifelinesForRevival,
  getRandomNumberBetween,
} from "./utils/utils";
import {
  QuestionState,
  QuestionType,
  AnswerType,
  LifelineType,
  BarType,
} from "./types";
import { useAxios } from "./hooks/useAxios";
import {
  Home,
  Modal,
  Loader,
  BarChart,
  GameRules,
  GameSummary,
  QuestionCard,
} from "./Components";

const TOTAL_QUESTIONS: number = +ENV_VARS.TOTAL_QUESTIONS!;
const APP_NAME: string = ENV_VARS.APP_NAME!;
const QUESTION_PRIZES: string[] = ENV_VARS.QUESTION_PRIZES?.split(";")!;

const App = () => {
  const history = useHistory();
  const [lifelines, setLifeLines] = useState<LifelineType>(
    INITIAL_STATE.LIFELINES
  );
  const [audiencePollAnswer, setAudiencePollAnswer] = useState<
    BarType[] | null
  >(null);
  const [expertAnswer, setExpertAnswer] = useState<string>("");
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
  const [seconds, setSeconds] = useState<number>(QUESTION_TIME.EASY);
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
    setSelectedLifeline("");

    setTimeout(() => {
      setLifeLines({
        ...lifelines,
        [LIFELINES_ENUM.REVIVE_LIFELINE]: true,
        [selectedLifelineForRevival]: false,
      });

      setSelectedLifelineForRevival("");
    }, 400);
  };

  const audiencePollConfirmHanlder = () => {
    setSelectedLifeline("");
    setAudiencePollAnswer(null);
    setTimeout(() => {
      let id = setInterval(tick, 1000);
      setTimerId(id);
    }, 400);
  };

  const expertAdviceConfirmHandler = () => {
    setSelectedLifeline("");
    setExpertAnswer("");
    setTimeout(() => {
      let id = setInterval(tick, 1000);
      setTimerId(id);
    }, 400);
  };

  const lifelineConfirmHandler = () => {
    if (selectedLifeline === LIFELINES_ENUM.REVIVE_LIFELINE) {
      setTimeout(
        () => setSelectedLifelineForRevival(getFirstUsedLifeline(lifelines)),
        400
      );
      return;
    }

    setLifeLines({
      ...lifelines,
      [selectedLifeline]: true,
    });

    if (selectedLifeline === LIFELINES_ENUM.AUDIENCE_POLL) {
      clearInterval(timerId);

      let scores = shuffleArr([
        getRandomNumberBetween(10, 25),
        getRandomNumberBetween(10, 25),
        getRandomNumberBetween(10, 24),
      ]);
      let sum = scores.reduce((total, score) => total + score, 0);

      let correctAnswerIndex = questions[questionNumber].options.findIndex(
        (option: string) => option === questions[questionNumber].correct_answer
      );

      scores.splice(correctAnswerIndex, 0, 100 - sum);

      if (questionNumber > 6 && getRandomNumberBetween(1, 10) === 7)
        scores = shuffleArr(scores);

      let audienceAnswer: BarType[] = INITIAL_STATE.AUDIENCE_POLL_SCORE.map(
        (el: BarType, index: number) => {
          return {
            ...el,
            score: scores[index],
          };
        }
      );

      return setTimeout(() => setAudiencePollAnswer(audienceAnswer), 400);
    }

    if (selectedLifeline === LIFELINES_ENUM.EXPERT_ADVICE) {
      clearInterval(timerId);
      let answer: string = "";

      if (
        questionNumber > GAME_STEPS.SECOND &&
        getRandomNumberBetween(1, 10) === 7
      ) {
        answer =
          questions[questionNumber].incorrect_answers[
            getRandomNumberBetween(0, 2)
          ];
      } else answer = questions[questionNumber].correct_answer;

      let correctOptionIndex = questions[questionNumber].options.findIndex(
        (el: string) => el === answer
      );

      answer = `Option ${
        ["A", "B", "C", "D"][correctOptionIndex]
      } => ${answer}`;

      return setTimeout(() => setExpertAnswer(answer), 400);
    }

    if (LIFELINES_ENUM.DOUBLE_DIPP) {
      setSelectedLifeline("");
      clearInterval(timerId);
      let [option1, option2] = shuffleArr(
        questions[questionNumber].incorrect_answers
      ).slice(0, 2);
      setDoubleDippOptions([option1, option2]);
      return setTimeout(() => {
        let id = setInterval(tick, 1000);
        setTimerId(id);
      }, 1000);
    }
  };

  const startGame = async () => {
    if (!contestantName) {
      return setShowContestentError(true);
    }
    if (timerId) return;
    await fetchData({
      url: ENV_VARS.BASE_URL,
    });
    setGameOver(false);
    setPrizeWon("0");
    setUserAnswers([]);
    setQuestionNumber(0);
    setSeconds(QUESTION_TIME.EASY);
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
      setSeconds(
        questionNumber > GAME_STEPS.SECOND
          ? QUESTION_TIME.HARD
          : questionNumber > GAME_STEPS.FIRST
          ? QUESTION_TIME.MEDIUM
          : QUESTION_TIME.EASY
      );
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
        src={ENV_VARS.BRAND_LOGO_WEBP}
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
          ) ||
          audiencePollAnswer ||
          expertAnswer
            ? "info"
            : "confirm"
        }
        show={
          !!selectedLifeline || Boolean(audiencePollAnswer) || !!expertAnswer
        }
        confirmHandler={lifelineConfirmHandler}
        cancelHandler={() => setSelectedLifeline("")}
        closeHandler={
          selectedLifelineForRevival
            ? ReviveLifelineConfirmHandler
            : Boolean(audiencePollAnswer)
            ? audiencePollConfirmHanlder
            : expertAnswer
            ? expertAdviceConfirmHandler
            : () => setSelectedLifeline("")
        }
      >
        {selectedLifelineForRevival ? (
          <div className="lineline__revival__container">
            <h3 style={{ marginBottom: "1rem" }}>
              Please Select lifeline to revive
            </h3>
            {availableLifelinesForRevival.map(({ key, id }) => (
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
        ) : audiencePollAnswer ? (
          <div>
            <h1 className="modal__header">
              Below are the results of 'Audience Poll' lifeline
            </h1>
            <BarChart data={audiencePollAnswer} />
          </div>
        ) : expertAnswer ? (
          <div>
            <h1 className="modal__header">
              According to 'Expert Advice' lifeline correct answer is :
            </h1>
            <h2>{expertAnswer}</h2>
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
