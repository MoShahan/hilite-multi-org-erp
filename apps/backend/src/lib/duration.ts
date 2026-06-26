export const parseDurationToMs = (duration: string): number => {
  const match = duration.match(/^(\d+)([dhms])$/);

  if (!match) {
    return 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "d") {
    return value * 24 * 60 * 60 * 1000;
  }

  if (unit === "h") {
    return value * 60 * 60 * 1000;
  }

  if (unit === "m") {
    return value * 60 * 1000;
  }

  return value * 1000;
};
