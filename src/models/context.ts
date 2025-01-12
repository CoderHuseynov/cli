export interface Context {
	courseUrl?: string;
	courseId?: string;
	searchQuery?: string;
	key?: string;
	captions?: string;
	startChapter?: number;
	startLecture?: number;
	endChapter?: number;
	endLecture?: number;
	config: Config;
}

export interface Config {
	cookiePath?: string;
	concurrent?: number;
	cookieType?: "json" | "netscape";
	skipCaptions?: boolean;
	skipAssets?: boolean;
	skipLectures?: boolean;
	skipArticles?: boolean;
	skipAssignments?: boolean;
	captionType?: "vtt" | "srt";
}
