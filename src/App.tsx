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
  speak,
  cancelSpeak,
  getFromLocalStorage,
  saveToLocalStorage,
  toggleSpeak,
  recogniser,
  getFromSessionStorage,
  saveToSessionStorage,
} from "./utils/utils";
import {
  checkForLifeline,
  checkForQuitGame,
  getMachedAnswerIndex,
} from "./utils/fussyMatch";
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
  NotFound,
  GameRules,
  GameSummary,
  QuestionCard,
  SpeakerIcon,
  MicrophoneIcon,
} from "./Components";
const DOMPurify = require("dompurify")(window);

const TOTAL_QUESTIONS: number = +ENV_VARS.TOTAL_QUESTIONS!;
const APP_NAME: string = ENV_VARS.APP_NAME!;
const QUESTION_PRIZES: string[] = ENV_VARS.QUESTION_PRIZES?.split(";")!;

const App = () => {
  const history = useHistory();
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [lifelineError, setLifelineError] = useState<string>("");
  const [microphoneEnabled, setMicrophoneEnabled] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    getFromLocalStorage(`${ENV_VARS.APP_NAME}__sound__enabled`) ?? false
  );
  const [recognizedText, setRecognizedText] = useState<string>("");
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
  const [contestantName, setContestantName] = useState<string>(
    getFromSessionStorage(`${ENV_VARS.APP_NAME}__contestantName`) || ""
  );
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

  const toggleMicrophone = () => {
    try {
      let a = microphoneEnabled;
      if (a) {
        setSpeaking(false);
        recogniser.stop();
      } else {
        recogniser?.start();
      }
      setMicrophoneEnabled((m) => !m);
    } catch (e) {
      console.error("microphone error");
    }
  };

  const toggleSound = () => {
    let a = soundEnabled;
    toggleSpeak(a);
    saveToLocalStorage(`${ENV_VARS.APP_NAME}__sound__enabled`, !soundEnabled);
    setSoundEnabled((s) => !s);
  };

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
    const { correct_answer = "" } = questions[questionNumber];
    questionNumber < TOTAL_QUESTIONS &&
      speak(`Correct answer was ${correct_answer}`);
    setTimeout(
      () => {
        setTimerId(null);
        setRecognizedText("");
        setSelectedLifeline("");
        setMicrophoneEnabled(false);
        setGameOver(true);
        cancelSpeak();
        setLifeLines((lifelines) => ({
          ...lifelines,
          ...INITIAL_STATE.LIFELINES,
        }));
        history.push("/summary");
      },
      correct_answer?.length > 20
        ? 4000
        : correct_answer?.length > 30
        ? 6000
        : correct_answer?.length > 40
        ? 8000
        : 3000
    );
  };

  const chooseLifeline = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedLifeline(e.currentTarget.value);
  };

  useEffect(() => {
    if (!soundEnabled) cancelSpeak();
  }, [soundEnabled]);

  useEffect(() => {
    if (contestantName)
      saveToSessionStorage(
        `${ENV_VARS.APP_NAME}__contestantName`,
        contestantName
      );
  }, [contestantName]);

  useEffect(() => {
    if (selectedLifeline)
      speak(`Are you sure you want to use ${selectedLifeline} lifeline?`);
    if (wantToQuitGame) speak("Are you sure you want to quit?");
  }, [selectedLifeline, wantToQuitGame]);

  const ReviveLifelineConfirmHandler = () => {
    setSelectedLifeline("");

    setTimeout(() => {
      setLifeLines((lifelines) => ({
        ...lifelines,
        [LIFELINES_ENUM.REVIVE_LIFELINE]: true,
        [selectedLifelineForRevival]: false,
      }));

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
      setTimeout(() => {
        speak("Please select lifeline to revive.");
        setSelectedLifelineForRevival(getFirstUsedLifeline(lifelines));
      }, 400);
      return;
    }

    setLifeLines((lifelines) => ({
      ...lifelines,
      [selectedLifeline]: true,
    }));

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

      return setTimeout(() => {
        setAudiencePollAnswer(audienceAnswer);
        speak(
          `According to audience poll lifeline correct answer is option. ${
            ["a", "b", "c", "d"][correctAnswerIndex]
          }`
        );
      }, 400);
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

      return setTimeout(() => {
        setExpertAnswer(answer);
        speak(
          `According to 'Expert Advice' lifeline correct answer is ${answer
            .split("=>")
            .join(" ")}`
        );
      }, 400);
    }

    if (LIFELINES_ENUM.DOUBLE_DIPP) {
      setSelectedLifeline("");
      clearInterval(timerId);
      let [option1, option2] = shuffleArr(
        questions[questionNumber].incorrect_answers
      ).slice(0, 2);
      setDoubleDippOptions([option1, option2]);
      return setTimeout(() => {
        speak(`Two wrong answers have been vanished.`);
        let id = setInterval(tick, 1000);
        setTimerId(id);
      }, 500);
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
    cancelSpeak();
    history.push("/");
  };

  const quitGame = () => {
    setWantToQuitGame(true);
  };

  const changeRevivalLifeline = (selectedRevivalLifeline: string) => {
    setSelectedLifelineForRevival(selectedRevivalLifeline);
  };

  const quitGameConfirmHandler = () => {
    const answer: AnswerType = {
      correct: false,
      answer: "",
      correct_answer: questions[questionNumber].correct_answer,
      question: questions[questionNumber].question,
    };
    setUserAnswers((answers) => [...answers, answer]);
    setWantToQuitGame(false);
    setTimeout(() => gameOverMethod(), 200);
  };

  const checkAnswer = (e?: React.MouseEvent<HTMLButtonElement>) => {
    cancelSpeak();
    let answer = "";

    if (recognizedText) {
      setRecognizedText("");
      let matchedIndex = getMachedAnswerIndex(
        recognizedText.toLocaleLowerCase(),
        questions[questionNumber].options
      );

      if (matchedIndex !== -1)
        answer = questions[questionNumber].options[matchedIndex];
    } else {
      answer = e?.currentTarget.value || "";
    }

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
      setPrizeWon(
        questionNumber > GAME_STEPS.SECOND
          ? QUESTION_PRIZES[GAME_STEPS.SECOND]
          : questionNumber > GAME_STEPS.FIRST
          ? QUESTION_PRIZES[GAME_STEPS.FIRST]
          : "0"
      );
      gameOverMethod();
    }
  };

  useEffect(() => {
    window.onbeforeunload = function () {
      cancelSpeak();
      return "Are you sure you want to leave?";
    };
  }, []);

  useEffect(() => {
    if (recogniser) {
      const startRecogniserHandler = () => {
        cancelSpeak();
        setSpeaking(true);
      };

      const recogniserResultsHandler = (e: any) => {
        setSpeaking(false);
        setMicrophoneEnabled(false);
        const { transcript } = e.results[0][0];

        let quitGame = checkForQuitGame(transcript.toLowerCase());

        if (!quitGame) {
          return setWantToQuitGame(true);
        }

        let { enumKey, lifelineKey } = checkForLifeline(
          transcript.toLowerCase()
        );

        if (enumKey === "none") {
          return setRecognizedText(transcript);
        } else {
          if (
            (lifelineKey === LIFELINES_ENUM.REVIVE_LIFELINE &&
              LIFELINES_ENUM.REVIVE_LIFELINE) ===
            getFirstUsedLifeline(lifelines)
          ) {
            return setLifelineError(
              "You can't use this lifeline now, You can choose any other available lifeline"
            );
          }

          if (!lifelines[lifelineKey as keyof LifelineType]) {
            setSelectedLifeline(
              LIFELINES_ENUM[enumKey as keyof typeof LIFELINES_ENUM]
            );
          } else {
            return (
              lifelineKey &&
              setLifelineError(`You have already used ${lifelineKey}.`)
            );
          }
        }
      };

      const recogniserEndHandler = () => {
        setSpeaking(false);
        setMicrophoneEnabled(false);
      };

      recogniser.addEventListener("end", recogniserEndHandler);
      recogniser.addEventListener("start", startRecogniserHandler);
      recogniser.addEventListener("result", recogniserResultsHandler);

      return () => {
        recogniser.removeEventListener("end", recogniserEndHandler);
        recogniser.removeEventListener("start", startRecogniserHandler);
        recogniser.removeEventListener("result", recogniserResultsHandler);
      };
    }
  }, [lifelines]);

  useEffect(() => {
    if (questionNumber > -1) {
      setRecognizedText("");
      setMicrophoneEnabled(false);
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
    if (questionNumber === TOTAL_QUESTIONS) {
      setTimerId(null);
      clearInterval(timerId);
      setGameOver(true);
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

  if (error)
    return (
      <div className="error__container">
        <h1>Some Error Occurred</h1>
      </div>
    );

  return (
    <div className="App">
      <picture>
        <source
          media="(max-width: 600px)"
          srcSet={ENV_VARS.BRAND_LOGO_WEBP_MOBILE}
        />
        <source media="(max-width: 1023px)" srcSet={ENV_VARS.BRAND_LOGO_WEBP} />
        <source
          media="(min-width: 1024px)"
          srcSet={ENV_VARS.BRAND_LOGO_WEBP_MOBILE}
        />
        <img
          draggable={false}
          width={260}
          height={146}
          src={ENV_VARS.BRAND_LOGO_WEBP_MOBILE}
          alt={APP_NAME}
        />
      </picture>
      {gameOver && <h1 className="brand">{APP_NAME}</h1>}
      {(loading || loadingNextQuestion || speaking) && <Loader />}

      <Modal
        type={
          wantToQuitGame || !!recognizedText
            ? "confirm"
            : showRules || !!lifelineError
            ? "info"
            : "default"
        }
        confirmHandler={
          wantToQuitGame
            ? quitGameConfirmHandler
            : !!recognizedText
            ? checkAnswer
            : () => {}
        }
        cancelHandler={
          wantToQuitGame
            ? () => setWantToQuitGame(false)
            : !!recognizedText
            ? () => setRecognizedText("")
            : () => {}
        }
        show={
          showRules ||
          showContestentError ||
          wantToQuitGame ||
          !!recognizedText ||
          !!lifelineError
        }
        closeHandler={
          lifelineError
            ? () => setLifelineError("")
            : showRules
            ? () => setShowRules(false)
            : wantToQuitGame
            ? () => setWantToQuitGame(false)
            : !!recognizedText
            ? () => setRecognizedText("")
            : () => setShowContestentError(false)
        }
      >
        {showRules && <GameRules />}
        {!!lifelineError && <h3 className="modal__header">{lifelineError}</h3>}
        {showContestentError && <h1>Please provide contestant name!</h1>}
        {wantToQuitGame && <h1>Are you sure you want to quit?</h1>}
        {!!recognizedText && (
          <div className="recogniser__modal-container">
            <h3 className="modal__header">
              Check current answer below, if not correct tell us new answer
              using microphone.
            </h3>
            <h1>current answer - {recognizedText}</h1>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <MicrophoneIcon
                toggle={toggleMicrophone}
                enabled={microphoneEnabled}
              />
            </div>
          </div>
        )}
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
        cancelHandler={() => {
          setSelectedLifeline("");
          setSelectedLifelineForRevival("");
        }}
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
              Please select lifeline to revive
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
            <h2
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(expertAnswer),
              }}
            />
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
        <Route>
          <NotFound soundEnabled={soundEnabled} goToHome={goToHome} />
        </Route>
      </Switch>
      {(!gameOver ||
        ("webkitSpeechRecognition" in window &&
          "speechRecognition" in window)) && (
        <div
          style={{
            position: "fixed",
            right: "20px",
            bottom: "8.2rem",
          }}
        >
          <MicrophoneIcon
            enabled={microphoneEnabled}
            toggle={toggleMicrophone}
          />
        </div>
      )}

      <div
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
        }}
      >
        <SpeakerIcon enabled={soundEnabled} toggle={toggleSound} />
      </div>
    </div>
  );
};

export default App;
