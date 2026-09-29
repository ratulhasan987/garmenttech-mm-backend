export type Holiday = {
  name: string;
  date: string;
};

export const mapHolidaysToEvents = (holidays: Holiday[]) =>
  holidays.map((h) => ({
    start: h.date,
    end: h.date,
    display: "background" as const,
    backgroundColor: "rgb(255, 165, 0)",
    extendedProps: {
      tooltip: `${h.name}`,
    },
  }));
