/**
 * INoteRepository Interface
 * Repository pattern for Notes persistence.
 * Domain layer - no external dependencies, pure interface.
 */

export interface Note {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly color?: string;
    readonly createdAt: string;
    readonly type?: "note" | "diary" | "cornell";
    readonly cues?: string;
    readonly summary?: string;
}

export interface INoteRepository {
    getAll(): Promise<Note[]>;
    saveAll(notes: Note[]): Promise<void>;
}