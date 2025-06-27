export const correctSound = new Audio('/Sounds/jeopardy-ding-101soundboards.mp3');
export const incorrectSound = new Audio('/Sounds/jeopardy-incorrect-101soundboards.mp3');
export const dailyDoubleSound = new Audio('/Sounds/daily-double-101soundboards.mp3');
export const thinkMusic = new Audio('/Sounds/jeopardy-think-101soundboards.mp3');
export const clickSound = new Audio('/Sounds/zapsplat_multimedia_click_button_short_sharp_73510.mp3');

let enabled = true;

export const setSoundEnabled = (value: boolean): void => {
  enabled = value;
  if (!enabled) {
    correctSound.pause();
    incorrectSound.pause();
    dailyDoubleSound.pause();
    thinkMusic.pause();
    clickSound.pause();
    correctSound.currentTime = 0;
    incorrectSound.currentTime = 0;
    dailyDoubleSound.currentTime = 0;
    thinkMusic.currentTime = 0;
    clickSound.currentTime = 0;
  }
};

export const playCorrect = (): void => {
  if (!enabled) return;
  correctSound.currentTime = 0;
  correctSound.play().catch(console.warn);
};

export const playIncorrect = (): void => {
  if (!enabled) return;
  incorrectSound.currentTime = 0;
  incorrectSound.play().catch(console.warn);
};

export const playDailyDouble = (): void => {
  if (!enabled) return;
  dailyDoubleSound.currentTime = 0;
  dailyDoubleSound.play().catch(console.warn);
};

export const playThinkMusic = (): void => {
  if (!enabled) return;
  thinkMusic.currentTime = 0;
  thinkMusic.loop = true;
  thinkMusic.play().catch(console.warn);
};

export const stopThinkMusic = (): void => {
  thinkMusic.pause();
  thinkMusic.currentTime = 0;
};

export const playClick = (): void => {
  if (!enabled) return;
  clickSound.currentTime = 0;
  clickSound.play().catch(console.warn);
};

