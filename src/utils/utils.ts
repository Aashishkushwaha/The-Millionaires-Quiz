import { LifelineType } from "../types";

export const getQuestionsByDifficulty = (arr: any[]) => {
  let obj = arr.reduce((acc, item) => {
    if (!acc[item.difficulty]) acc[item.difficulty] = [item];
    else acc[item.difficulty].push(item);
    return acc;
  }, {});

  return [...obj?.easy, ...obj?.medium, ...obj?.hard];
};

export const shuffleArr = (arr: any) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

export enum LIFELINES_ENUM {
  REVIVE_LIFELINE = "Revive Lifeline",
  AUDIENCE_POLL = "Audience Poll",
  DOUBLE_DIPP = "Double Dipp",
  EXPERT_ADVICE = "Expert Advice",
}

export const getFirstUsedLifeline = (lifelines: LifelineType) => {
  return lifelines[LIFELINES_ENUM.AUDIENCE_POLL]
    ? LIFELINES_ENUM.AUDIENCE_POLL
    : lifelines[LIFELINES_ENUM.DOUBLE_DIPP]
    ? LIFELINES_ENUM.DOUBLE_DIPP
    : lifelines[LIFELINES_ENUM.EXPERT_ADVICE]
    ? LIFELINES_ENUM.EXPERT_ADVICE
    : LIFELINES_ENUM.REVIVE_LIFELINE;
};

export const INITIAL_STATE = {
  LIFELINES: {
    [LIFELINES_ENUM.AUDIENCE_POLL]: false,
    [LIFELINES_ENUM.REVIVE_LIFELINE]: false,
    [LIFELINES_ENUM.DOUBLE_DIPP]: false,
    [LIFELINES_ENUM.EXPERT_ADVICE]: false,
  },
};
