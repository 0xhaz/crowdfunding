export const daysLeft = (deadline: Date) => {
  const currentTime = new Date().getTime();
  const deadlineTime = new Date(deadline).getTime();

  if (currentTime > deadlineTime) return 0;

  const difference = deadlineTime - currentTime;
  const remainingDays = difference / (1000 * 3600 * 24);

  return remainingDays.toFixed(0);
};

export const calculateBarPercentage = (
  goal: number,
  raisedAmount: number
): number => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (
  url: string,
  callback: (arg: boolean) => void
): void => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};
