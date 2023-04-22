interface EntryDataBasic {
	name: string;
	icon: string;
	type: EntryType;
}

interface EntryData extends EntryDataBasic {
	id: string; // UUID
	created: number; // Timestamp
	modified: number; // Timestamp
}

const EntryType = {
	Directory: 'directory',
	File: 'file'
} as const;

type EntryType = (typeof EntryType)[keyof typeof EntryType];
