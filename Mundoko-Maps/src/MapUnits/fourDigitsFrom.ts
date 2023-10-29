class MapMeasurement {
  number: number;

  constructor(number: number) {
    this.number = number;
  }

  reduceFidelity = () => {
    this.number = Math.round(this.number / 10_000);
    return this;
  };

  loopNumbersAboveMax = () => {
    this.number = this.number >= 10_000 ? this.number % 10_000 : this.number;
    return this;
  };

  toString = () => this.number.toString();
}

export const fourDigitsFrom = (feet: number) =>
  new MapMeasurement(feet)
    .reduceFidelity()
    .loopNumbersAboveMax()
    .toString()
    .padStart(4, "0");
