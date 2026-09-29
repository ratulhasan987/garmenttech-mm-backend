export const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const getWeekendNumbers = (weekends: string[]): number[] =>
  weekends.map((day) => DAY_MAP[day]).filter((d) => d !== undefined);

export const getDayNameByIndex = (index: number): string | undefined =>
  Object.keys(DAY_MAP).find((key) => DAY_MAP[key] === index);
