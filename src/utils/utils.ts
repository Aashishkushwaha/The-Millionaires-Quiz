import { LifelineType } from "../types";
export let speech: any = null;
export let recogniser: any = null;

export enum LIFELINES_ENUM {
  REVIVE_LIFELINE = "Revive Lifeline",
  AUDIENCE_POLL = "Audience Poll",
  DOUBLE_DIPP = "Double Dipp",
  EXPERT_ADVICE = "Expert Advice",
}

export enum QUESTION_TIME {
  EASY = 45,
  MEDIUM = 60,
  HARD = 90,
}

export enum GAME_STEPS {
  FIRST = 4,
  SECOND = 9,
}

export enum SPEECH {
  PITCH = 0.85,
  RATE = 0.85,
  VOLUME = 0.8,
  LANG = "en",
}

export const availableLifelinesForRevival = [
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
];

export const ENV_VARS = {
  BASE_URL: process.env.REACT_APP_BASE_URL,
  QUESTION_PRIZES: process.env.REACT_APP_QUESTION_PRIZES,
  TOTAL_QUESTIONS: process.env.REACT_APP_TOTAL_QUESTIONS,
  APP_NAME: process.env.REACT_APP_APP_NAME,
  BRAND_LOGO_PNG: process.env.REACT_APP_BRAND_LOGO_PNG,
  BRAND_LOGO_WEBP: process.env.REACT_APP_BRAND_LOGO_WEBP,
};

export const INITIAL_STATE = {
  LIFELINES: {
    [LIFELINES_ENUM.AUDIENCE_POLL]: false,
    [LIFELINES_ENUM.REVIVE_LIFELINE]: false,
    [LIFELINES_ENUM.DOUBLE_DIPP]: false,
    [LIFELINES_ENUM.EXPERT_ADVICE]: false,
  },
  AUDIENCE_POLL_SCORE: [
    {
      score: 40,
      label: "A",
      title: "Option A",
    },
    {
      score: 10,
      label: "B",
      title: "Option B",
    },
    {
      score: 30,
      label: "C",
      title: "Option C",
    },
    {
      score: 20,
      label: "D",
      title: "Option D",
    },
  ],
};

export const getRandomNumberBetween = (min = 1, max = 10) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const getQuestionsByDifficulty = (arr: any[]) => {
  let obj = arr.reduce((acc, item) => {
    !acc[item.difficulty]
      ? (acc[item.difficulty] = [item])
      : acc[item.difficulty].push(item);
    return acc;
  }, {});

  return [...(obj?.easy || []), ...(obj?.medium || []), ...(obj?.hard || [])];
};

export const shuffleArr = (arr: any) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

export const getFirstUsedLifeline = (lifelines: LifelineType) => {
  return lifelines[LIFELINES_ENUM.AUDIENCE_POLL]
    ? LIFELINES_ENUM.AUDIENCE_POLL
    : lifelines[LIFELINES_ENUM.DOUBLE_DIPP]
    ? LIFELINES_ENUM.DOUBLE_DIPP
    : lifelines[LIFELINES_ENUM.EXPERT_ADVICE]
    ? LIFELINES_ENUM.EXPERT_ADVICE
    : LIFELINES_ENUM.REVIVE_LIFELINE;
};

export const initializeSpeechRecogniser = (): void => {
  if ("webkitSpeechRecognition" in window || "speechRecognition" in window) {
    try {
      let rec =
        (window as any).webkitSpeechRecognition ||
        (window as any).speechRecognition;
      recogniser = new rec();
    } catch (error) {
      alert("Speech recognition is not avaible for this browser");
    }
  }
};

export const initializeTextToSpeech = (): void => {
  if ("speechSynthesis" in window) {
    speech = new SpeechSynthesisUtterance();
    speech.rate = SPEECH.RATE;
    speech.pitch = SPEECH.PITCH;
    speech.volume = getFromLocalStorage(`${ENV_VARS.APP_NAME}__sound__enabled`)
      ? SPEECH.VOLUME
      : 0;
    speech.lang = SPEECH.LANG;
  }
};

export const cancelSpeak = () => {
  return new Promise((resolve, reject) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.speaking && window.speechSynthesis.cancel();
      resolve(null);
    }
  });
};

export const toggleSpeak = (value: boolean) => {
  if ("speechSynthesis" in window) {
    speech.volume = value ? 0 : SPEECH.VOLUME;
  }
};

export const speak = (msg: string) => {
  if ("speechSynthesis" in window) {
    cancelSpeak().then(() => {
      speech.text = msg;
      speechSynthesis.speak(speech);
    });
  }
};

export const saveToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromLocalStorage = (key: any) => {
  return !key ? null : JSON.parse(localStorage.getItem("" + key) as string);
};
