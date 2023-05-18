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

const entryType = {
	Directory: 'directory',
	File: 'file'
} as const;

export type EntryType = (typeof entryType)[keyof typeof entryType];

export const broadcastMessage = {
	SaveFile: 'save-file'
} as const;

export interface Export extends EntryData {
	content?: string;
	children?: Export[];
}
