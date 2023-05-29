export interface EntryDataBasic {
	name: string;
	icon: string;
	type: EntryType;
}

export interface EntryData extends EntryDataBasic {
	id: string; // UUID
	modified: number; // UNIX Timestamp
	description: string;
}

const entryType = {
	Directory: 'directory',
	Note: 'note', // String content
	Img: 'image',
	Video: 'video',
	Audio: 'audio'
} as const;
export type EntryType = (typeof entryType)[keyof typeof entryType];

export interface Export extends EntryData {
	content?: string;
	children?: Export[];
}

export const broadcastMessage = {
	Hello: 'hello',
	HelloResponse: 'hello-response',
	SaveFile: 'save-file'
} as const;
