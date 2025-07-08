import { format } from 'date-fns';

export const groupTasksByDate = (tasks) => {
  const grouped = {};

  tasks.forEach(task => {
    const dayKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(task);
  });

  return Object.entries(grouped).map(([dateKey, items]) => ({
    title: format(new Date(dateKey), 'dd MMM • EEEE'),
    data: items.sort((a, b) => a.priority - b.priority),
  }));
};
