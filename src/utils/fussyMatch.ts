import Fuse from "fuse.js";

// fuse config for answer
const fuse_options = {
  includeScore: true,
  // Search in `options` array
  keys: ["options"],
};

const fuzzyAnswersList = [
  {
    options: [
      "option 1",
      "answer 1",
      "option a",
      "answer a",
      "option one",
      "answer one",
      "optiona",
      "answera ",
    ],
  },
  {
    options: [
      "option 2",
      "answer 2",
      "option b",
      "answer b",
      "option two",
      "option two",
      "answer tu",
      "answer tu",
    ],
  },
  {
    options: [
      "option 3",
      "answer 3",
      "option c",
      "answer c",
      "option three",
      "option three",
      "answer tree",
      "answer tree",
    ],
  },
  {
    options: [
      "option 4",
      "answer 4",
      "option d",
      "answer d",
      "option four",
      "option four",
      "answer for",
      "answer for",
    ],
  },
];

const fussyLifelinesList = [
  {
    options: [
      "audience poll",
      "lifeline audience poll",
      "audience poll lifeline",
    ],
  },
  {
    options: [
      "revive lifeline lifeline",
      "lifeline revive lifeline",
      "revive lifeline",
      "lifeline revive",
    ],
  },
  {
    options: [
      "double dip lifeline",
      "double dip life line",
      "double lifeline",
      "double life line",
      "life line double dip",
      "life line double dip",
      "lifeline double",
      "lifeline double",
    ],
  },
  {
    options: [
      "expert advice lifeline",
      "expert advice life line",
      "lifeline expert advice",
      "life line expert advice",
    ],
  },
];

const fussyQuitGameList = [
  { options: ["quit game", "quit", "finish", "finish game"] },
];

export const getMachedAnswerIndex = (
  recognisedText: string,
  options: string[]
): number => {
  let modifiedFussyAnswerList = fuzzyAnswersList.map(
    (item: { options: string[] }, index: number) => {
      item.options.unshift(options[index]);
      return item;
    }
  );

  const answers_fuse = new Fuse(modifiedFussyAnswerList, fuse_options);
  const [result] = answers_fuse.search(recognisedText);

  return result?.refIndex ?? -1;
};

export const checkForQuitGame = (transcript: string): number => {
  const lifelieFuse = new Fuse(fussyQuitGameList, fuse_options);
  const [result] = lifelieFuse.search(transcript);

  return result?.refIndex ?? -1;
};

export const checkForLifeline = (
  transcript: string
): { enumKey: string; lifelineKey: string } => {
  const lifelieFuse = new Fuse(fussyLifelinesList, fuse_options);
  const [result] = lifelieFuse.search(transcript);

  switch (result?.refIndex) {
    case 0:
      return { enumKey: "AUDIENCE_POLL", lifelineKey: "Audience Poll" };
    case 1:
      return { enumKey: "REVIVE_LIFELINE", lifelineKey: "Revive Lifeline" };
    case 2:
      return { enumKey: "DOUBLE_DIPP", lifelineKey: "Double Dipp" };
    case 3:
      return { enumKey: "EXPERT_ADVICE", lifelineKey: "Expert Advice" };
    default:
      return { enumKey: "none", lifelineKey: "none" };
  }
};
