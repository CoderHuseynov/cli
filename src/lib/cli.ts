import type { Context } from "@/models/context";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getVersion } from "./utils";
import { log } from "./logger";

export async function parseArgs(): Promise<Context> {
	const argv = await yargs(hideBin(process.argv))
		.usage("Usage: $0 [options]")
		.options({
			// General Options
			cookie: {
				alias: "c",
				describe: "Path to the cookie file for authentication",
				type: "string",
				group: "General"
			},
			key: {
				alias: "k",
				describe: "Decryption key for DRM-protected videos",
				type: "string",
				group: "General"
			},

			// Course Identification
			url: {
				alias: "u",
				describe: "URL of the Udemy course",
				type: "string",
				group: "Course Identification"
			},
			id: {
				alias: "i",
				describe: "ID of the Udemy course",
				type: "string",
				group: "Course Identification"
			},
			search: {
				describe: "Search query",
				type: "string",
				array: true,
				group: "Course Identification"
			},

			// Download Options
			concurrent: {
				alias: "n",
				describe: "Maximum number of downloads to process concurrently",
				type: "number",
				group: "Download Options"
			},
			captions: {
				describe: "List of captions to download, separated by commas",
				type: "string",
				group: "Download Options"
			},
			"caption-type": {
				describe: "Format of captions to download (vtt or srt)",
				choices: ["vtt", "srt"],
				type: "string",
				group: "Download Options"
			},
			"start-chapter": {
				describe: "Start downloading from the specified chapter number",
				type: "number",
				group: "Download Options"
			},
			"start-lecture": {
				describe: "Start downloading from the specified lecture number",
				type: "number",
				group: "Download Options"
			},
			"end-chapter": {
				describe: "Stop downloading at the specified chapter number",
				type: "number",
				group: "Download Options"
			},
			"end-lecture": {
				describe: "Stop downloading at the specified lecture number",
				type: "number",
				group: "Download Options"
			},

			// Skip Options
			"skip-captions": {
				describe: "Exclude captions from download",
				type: "boolean",
				group: "Skip Options"
			},
			"skip-assets": {
				describe: "Exclude course assets from download",
				type: "boolean",
				group: "Skip Options"
			},
			"skip-lectures": {
				describe: "Exclude video lectures from download",
				type: "boolean",
				group: "Skip Options"
			},
			"skip-articles": {
				describe: "Exclude articles from download",
				type: "boolean",
				group: "Skip Options"
			},
			"skip-assignments": {
				describe: "Exclude assignments from download",
				type: "boolean",
				group: "Skip Options"
			}
		})
		.version(`Udemix ${(await getVersion()) ?? "Unknown"}`)
		.help()
		.alias("h", "help")
		.alias("v", "version")
		.wrap(null)
		.middleware((argv) => {
			// TODO: Handle Multiple Arguments
			if (argv.search && Array.isArray(argv.search)) {
				argv["combinedSearch"] = argv.search.join(" ").trim();
			}
		})
		.strict()
		.parse();

	if (!argv.url && !argv.id && !argv["combinedSearch"]) {
		log.error("Missing required parameter. Either '--url' or '--id' must be provided to proceed.");
		process.exit(1);
	}

	const context: Context = {
		courseUrl: argv.url,
		courseId: argv.id,
		key: argv.key,
		searchQuery: argv["combinedSearch"] as string,
		captions: argv.captions,
		startChapter: argv["start-chapter"],
		startLecture: argv["start-lecture"],
		endChapter: argv["end-chapter"],
		endLecture: argv["end-lecture"],
		config: {
			cookiePath: argv.cookie,
			concurrent: argv.concurrent,
			skipCaptions: argv["skip-captions"],
			skipAssets: argv["skip-assets"],
			skipLectures: argv["skip-lectures"],
			skipArticles: argv["skip-articles"],
			skipAssignments: argv["skip-assignments"],
			captionType: argv["caption-type"] as "vtt" | "srt"
		}
	};

	return context;
}
