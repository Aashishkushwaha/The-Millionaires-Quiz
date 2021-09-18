import { LifelineType } from "../types";
export let speech: any = null;
export let recogniser: any = null;

export const GAME_RULES = [
  `The Millionaire's Quiz will have total 16 questions, where each question will be having particular prize associated with it.`,
  `Each question will be having 4 options, one of them will be correct & rest will be incorrect.`,
  `If you answer the question correctly then your maximum prize till that question will be the prize associated with that question.`,
  `If you want to answer the question you can click on the option or you can speak the answer using microphone.`,
  `While answering please use the correct option or please use words like 'option' or 'answer' - [your selected option]. Eg. 'option A' | 'answer A' | 'option 1' | 'answer 1'.`,
  `You will be getting 4 lifelines to help yourself whenever you're not sure about the answer for that question.`,
  `Even though lifelies provides you some help to find the answer for question final call for the answer is still yours.`,
  `To use any lifeline click on the lifeline button or speak the name of the lifeline using microphone, while speaking please suffix 'lifeline' to the lifeline which you want to use. Eg. 'Audience Poll lifeline' or 'Double Dipp lifeline'.`,
  `Lifeline (Audience Poll) - 'Audience poll lifeline' will give you the result of audience for each option which will be displayed the bar chart.`,
  `Lifeline (Revive Lifeline) - You can use 'Revive lifeline' to reuse any of the already used lifeline.`,
  `Lifeline (Double Dipp) - If you use 'Double Dipp lifeline' for the question it will vanish 2 wrong options.`,
  `Lifeline (Expert Advice) - 'Revive lifeline' will give you the answer which is provided by the subject expert.`,
  `Even after taking help from your lifeline and you're not satisfied with the help or if you've already used all lifelines then you can quit the game at that moment.`,
  `You can quit the game by clicking the button 'Quit Game' or by speaking 'Finish game' or 'Quit game' using microphone.`,
  `The moment you quit the game you'll be getting the prize which you've won till that moment.`,
  `If you have lost (not quit) the game before 6th question then you'll earn prize 0.`,
  `If you have lost (not quit) the game after 5th question & before 10th question then you'll earn prize 10,000.`,
  `If you have lost (not quit) the game after 9th question then you'll earn prize 3,20,000.`,
  `If you're currently on Q.no 6th or 11th we encourage you to play that question because even if you lost then also you'll be getting the same prize which you've won till that question.`,
  `You can click on the microphone icon to record you answer using voice, you can change your answer by repeating the process.`,
  `Sound mode: You can click on the speaker icon to enable the sound mode.`,
  `Note:=> Sometimes software may not be able to detect the correct speech (what you've spoken in the microphone) at that time I request you to please use buttons functionality.`,
  `Most important rule: Have Fun 😁 and enjoy the game 🙂.`,
];

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
  BRAND_LOGO_WEBP_MOBILE: process.env.REACT_APP_BRAND_LOGO_WEBP_MOBILE,
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
      let btn = document.createElement("button");
      btn.setAttribute("aria-label", "play sound");
      document.body.appendChild(btn);
      btn.addEventListener("click", () => {
        speechSynthesis.speak(speech);
      });
      btn.click();
    });
  }
};

export const saveToSessionStorage = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getFromSessionStorage = (key: any) => {
  return !key ? null : JSON.parse(sessionStorage.getItem("" + key) as string);
};

export const saveToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromLocalStorage = (key: any) => {
  return !key ? null : JSON.parse(localStorage.getItem("" + key) as string);
};
