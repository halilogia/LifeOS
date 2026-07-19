/**
 * AlarmUseCase
 * Application use case for alarm operations.
 * Orchestrates alarm state through storage.
 */

export interface AlarmItem {
    readonly id: string;
    readonly time: string;
    readonly enabled: boolean;
}

export interface IAlarmRepository {
    getAll(): Promise<AlarmItem[]>;
    saveAll(alarms: AlarmItem[]): Promise<void>;
    onChanged(callback: (alarms: AlarmItem[]) => void): () => void;
}

export class AlarmUseCase {
    constructor(private alarmRepo: IAlarmRepository) { }

    async getAll(): Promise<AlarmItem[]> {
        return this.alarmRepo.getAll();
    }

    async add(time: string): Promise<AlarmItem[]> {
        const alarms = await this.alarmRepo.getAll();
        if (alarms.some((a) => a.time === time)) {
            return alarms;
        }
        const newAlarm: AlarmItem = {
            id: Math.random().toString(36).substring(2, 9),
            time,
            enabled: true,
        };
        const updated = [...alarms, newAlarm].sort((a, b) =>
            a.time.localeCompare(b.time),
        );
        await this.alarmRepo.saveAll(updated);
        return updated;
    }

    async toggle(id: string, enabled: boolean): Promise<AlarmItem[]> {
        const alarms = await this.alarmRepo.getAll();
        const updated = alarms.map((a) =>
            a.id === id ? { ...a, enabled } : a,
        );
        await this.alarmRepo.saveAll(updated);
        return updated;
    }

    async delete(id: string): Promise<AlarmItem[]> {
        const alarms = await this.alarmRepo.getAll();
        const updated = alarms.filter((a) => a.id !== id);
        await this.alarmRepo.saveAll(updated);
        return updated;
    }

    onChanged(callback: (alarms: AlarmItem[]) => void): () => void {
        return this.alarmRepo.onChanged(callback);
    }
}