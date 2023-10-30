const MAP_SIZE = 100_000_000;
const FIDELITY = 10_000;
const LOOP_POINT = MAP_SIZE / FIDELITY;

class MapPoint {
  number: number;

  constructor(number: number) {
    this.number = number;
  }

  reduceFidelity = () => {
    this.number = Math.round(this.number / FIDELITY);
    return this;
  };

  loopNumbersAboveMax = () => {
    if (this.number >= LOOP_POINT) {
      this.number = this.number % LOOP_POINT;
    }
    return this;
  };

  loopNumbersBelowZero = () => {
    if (this.number < 0) {
      this.number = LOOP_POINT + (this.number % LOOP_POINT);
    }
    return this;
  };

  toString = () => this.number.toString();

  public get value() {
    if (this.number === -0) {
      return 0;
    }
    return this.number;
  }
}

export const feetToMapPoint = (feet: number) =>
  new MapPoint(feet)
    .reduceFidelity()
    .loopNumbersAboveMax()
    .loopNumbersBelowZero();
