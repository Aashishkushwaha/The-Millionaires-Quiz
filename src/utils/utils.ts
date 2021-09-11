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
