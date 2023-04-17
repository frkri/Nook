interface EntryDataBasic {
	name: string;
	icon: string; // Image URL
	type: EntryType;
}

interface EntryData extends EntryDataBasic {
	id: string; // UUID
	created: number;
	modified: number;
}

enum EntryType {
	Directory = 'directory',
	File = 'file'
}
