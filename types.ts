export interface Todo {
    text: string;
    completed: boolean;
    status: 'todo' | 'in-progress' | 'done';
    repeat: 'none' | 'daily' | 'weekly' | 'monthly';
    lastCompletedDate: string | null;
}

export type Language = 'tr' | 'en';
