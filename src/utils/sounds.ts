export const correctSound = new Audio('/Sounds/jeopardy-ding-101soundboards.mp3');
export const incorrectSound = new Audio('/Sounds/jeopardy-incorrect-101soundboards.mp3');
export const dailyDoubleSound = new Audio('/Sounds/daily-double-101soundboards.mp3');
export const thinkMusic = new Audio('/Sounds/jeopardy-think-101soundboards.mp3');

export const playCorrect = (): void => {
  correctSound.currentTime = 0;
  correctSound.play().catch(console.warn);
};

export const playIncorrect = (): void => {
  incorrectSound.currentTime = 0;
  incorrectSound.play().catch(console.warn);
};

export const playDailyDouble = (): void => {
  dailyDoubleSound.currentTime = 0;
  dailyDoubleSound.play().catch(console.warn);
};

export const playThinkMusic = (): void => {
  thinkMusic.currentTime = 0;
  thinkMusic.loop = true;
  thinkMusic.play().catch(console.warn);
};

export const stopThinkMusic = (): void => {
  thinkMusic.pause();
  thinkMusic.currentTime = 0;
};

