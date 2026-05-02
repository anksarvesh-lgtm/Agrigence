import Dexie, { Table } from 'dexie';

export interface CropCycle {
  id?: number;
  userId: string;
  name: string;
  area: number;
  sowingDate: string;
}

export interface Expense {
  id?: number;
  userId: string;
  cycleId: number;
  category: 'Seeds' | 'Labor' | 'Fuel' | 'Pesticides' | 'Other';
  amount: number;
  date: string;
  receiptImagePath?: string;
  isVerified?: boolean; 
  gpsLocation?: string;
}

export interface SOPTask {
  id?: number;
  userId: string;
  cycleId: number;
  title: string;
  dayAfterSowing: number;
  isCompleted: boolean;
  completedDate?: string;
  photoUrl?: string;
  verifiedGps?: string;
}

export class KisanDatabase extends Dexie {
  cropCycles!: Table<CropCycle>;
  expenses!: Table<Expense>;
  sopTasks!: Table<SOPTask>;

  constructor() {
    super('AgriKisanDB');
    this.version(2).stores({
      cropCycles: '++id, userId, name, sowingDate',
      expenses: '++id, cycleId, userId, category, date',
      sopTasks: '++id, cycleId, userId, dayAfterSowing, isCompleted'
    });
  }
}

export const db = new KisanDatabase();
