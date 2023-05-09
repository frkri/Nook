export interface EntryDataBasic {
	name: string;
	icon: string;
	type: EntryType;
}

export interface EntryData extends EntryDataBasic {
	id: string; // UUID
	created: number; // Timestamp
	modified: number; // Timestamp
	description: string;
}

const EntryType = {
	Directory: 'directory',
	File: 'file'
} as const;

export type EntryType = (typeof EntryType)[keyof typeof EntryType];
