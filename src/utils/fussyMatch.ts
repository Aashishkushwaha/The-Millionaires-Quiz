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
      "1",
      "on",
      "1st",
      "one",
      "fist",
      "first",
      "optiona",
      "option a",
      "option 1",
      "1 option",
      "1st option",
      "option 1st",
      "option one",
      "option fist",
      "fist option",
      "first option",
      "option first",
    ],
  },
  {
    options: [
      "2",
      "to",
      "tu",
      "2nd",
      "two",
      "second",
      "option 2",
      "option b",
      "option be",
      "option to",
      "option tu",
      "to option",
      "tu option",
      "two option",
      "option two",
      "second option",
      "3rd last option",
      "third last option",
    ],
  },
  {
    options: [
      "c",
      "3",
      "see",
      "sea",
      "tree",
      "three",
      "third",
      "3 option",
      "option c",
      "option ce",
      "3rd option",
      "option see",
      "option sea",
      "tree option",
      "option third",
      "third option",
      "three option",
      "2nd last option",
      "second last option",
    ],
  },
  {
    options: [
      "4",
      "d",
      "for",
      "four",
      "last",
      "option d",
      "option 4",
      "4 option",
      "option de",
      "4th option",
      "for option",
      "option dee",
      "option 4th",
      "option for",
      "option dea",
      "last option",
      "four option",
      "option fort",
      "option forth",
      "option fourth",
      "fourth option",
    ],
  },
];

const fussyLifelinesList = [
  {
    options: [
      "audience poll lifeline",
      "audience poll",
      "poll",
      "audience",
      "first life line",
      "first lifeline",
      "1st lifeline",
      "lifeline one",
      "lifeline 1",
      "1st",
      "first",
      "one",
      "1",
    ],
  },
  {
    options: [
      "revive lifeline lifeline",
      "revive lifeline",
      "second lifeline",
      "second life line",
      "lifeline tu",
      "lifeline two",
      "lifeline 2",
      "2nd lifeline",
      "revive",
      "audience",
      "2nd",
      "second",
      "tu",
      "to",
      "two",
      "2",
      "third last",
    ],
  },
  {
    options: [
      "double dip lifeline",
      "double dip life line",
      "double life line",
      "third lifeline",
      "life line 3",
      "lifeline three",
      "life line three",
      "3rd lifeline",
      "dipp",
      "double",
      "3rd",
      "third",
      "second last",
      "2nd last",
      "2 last",
      "3",
      "3rd last",
      "3rd last lifeline",
    ],
  },
  {
    options: [
      "expert advice lifeline",
      "expert lifeline",
      "advice lifeline",
      "fourth lifeline",
      "forth  lifeline",
      "lifeline 4",
      "lifeline four",
      "lifeline forth",
      "lifeline fourth",
      "4th lifeline",
      "expert",
      "advice",
      "4th",
      "fourth",
      "forth",
      "for",
      "four",
      "last",
      "4",
      "last lifeline",
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
