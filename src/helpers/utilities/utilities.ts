

export function getRandomNumber (minValue: number, maxValue: number) {
  return Math.floor((Math.random() * (maxValue + 1 - minValue)) + minValue);
};