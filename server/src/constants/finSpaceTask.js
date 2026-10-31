// Tasks of a space (P9-06): the client's own vocabularies, tab 08 of the
// collective workbook. The migration's CHECKs list the same words.
export const SPACE_TASK_CATEGORIES = ['household', 'shopping', 'bills', 'children', 'admin', 'upkeep', 'project', 'pet', 'other'];
export const SPACE_TASK_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
// « personnalisée » is not offered: it needs a rule the client has not given.
export const SPACE_TASK_RECURRENCES = ['none', 'daily', 'weekly', 'monthly'];
export const SPACE_TASK_STATUSES = ['todo', 'doing', 'done', 'cancelled'];
// The weight of a task (rule A2): 1, 2 or 3.
export const SPACE_TASK_WEIGHTS = [1, 2, 3];
export const SPACE_TASKS_MAX = 500;
export const SPACE_TASK_CHECKLIST_MAX = 30;
