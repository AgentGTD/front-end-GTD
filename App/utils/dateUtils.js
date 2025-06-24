export const isToday = (date) => {
  const today = new Date();
  const target = new Date(date);
  return (
    today.getDate() === target.getDate() &&
    today.getMonth() === target.getMonth() &&
    today.getFullYear() === target.getFullYear()
  );
};

export const isBefore = (date, compareDate = new Date()) => {
  if (!date) return false;
  const target = new Date(date);
  // Set time to 0:00:00 for date-only comparison
  target.setHours(0, 0, 0, 0);
  const compare = new Date(compareDate);
  compare.setHours(0, 0, 0, 0);
  return target < compare;
};