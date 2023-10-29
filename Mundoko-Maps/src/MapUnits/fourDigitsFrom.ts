export const fourDigitsFrom = (feet: number) =>
  (feet / 10000).toString().padStart(4, "0");
