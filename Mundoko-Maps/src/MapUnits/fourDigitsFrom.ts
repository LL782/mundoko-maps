const reduceFidelity = (feet: number) => Math.round(feet / 10_000);

const loopNumbersAboveMax = (number: number) =>
  number >= 10_000 ? number % 10_000 : number;

export const fourDigitsFrom = (feet: number) =>
  loopNumbersAboveMax(reduceFidelity(feet)).toString().padStart(4, "0");
