export type ProgressReporter = {
  start(message: string): void;
  update(message: string): void;
  finish(message: string): void;
};

export const noopProgress: ProgressReporter = {
  start: () => {},
  update: () => {},
  finish: () => {},
};

export const consoleProgress: ProgressReporter = {
  start: (message) => console.log(message),
  update: (message) => console.log(message),
  finish: (message) => console.log(message),
};
