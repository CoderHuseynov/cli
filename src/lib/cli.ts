import type { Context } from "@/models/context";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getVersion } from "./utils";
import { log } from "./logger";
import { changeLanguage, t } from "./i18n";

export async function parseArgs(): Promise<Context> {
	const argv = await yargs(hideBin(process.argv))
		.usage(t("cli.args.usage") + "$0 [options]")
		.parserConfiguration({
			"duplicate-arguments-array": false
		})
		.options({
			// General Options
			cookie: {
				alias: "c",
				describe: t("cli.args.options.cookie.describe"),
				type: "string",
				group: t("cli.args.groups.general")
			},
			key: {
				alias: "k",
				describe: t("cli.args.options.key.describe"),
				type: "string",
				group: t("cli.args.groups.general")
			},
			locale: {
				alias: "l",
				describe: t("cli.args.options.locale.describe"),
				type: "string",
				group: t("cli.args.groups.general")
			},

			// Course Identification
			url: {
				alias: "u",
				describe: t("cli.args.options.url.describe"),
				type: "string",
				group: t("cli.args.groups.courseIdentification")
			},
			id: {
				alias: "i",
				describe: t("cli.args.options.id.describe"),
				type: "string",
				group: t("cli.args.groups.courseIdentification")
			},
			search: {
				describe: t("cli.args.options.search.describe"),
				type: "string",
				array: true,
				group: t("cli.args.groups.courseIdentification")
			},

			// Download Options
			concurrent: {
				alias: "n",
				describe: t("cli.args.options.concurrent.describe"),
				type: "number",
				group: t("cli.args.groups.downloadOptions")
			},
			captions: {
				describe: t("cli.args.options.captions.describe"),
				type: "string",
				group: t("cli.args.groups.downloadOptions")
			},
			"caption-type": {
				describe: t("cli.args.options.caption-type.describe"),
				choices: ["vtt", "srt"],
				type: "string",
				group: t("cli.args.groups.downloadOptions")
			},
			"start-chapter": {
				describe: t("cli.args.options.start-chapter.describe"),
				type: "number",
				group: t("cli.args.groups.downloadOptions")
			},
			"start-lecture": {
				describe: t("cli.args.options.start-lecture.describe"),
				type: "number",
				group: t("cli.args.groups.downloadOptions")
			},
			"end-chapter": {
				describe: t("cli.args.options.end-chapter.describe"),
				type: "number",
				group: t("cli.args.groups.downloadOptions")
			},
			"end-lecture": {
				describe: t("cli.args.options.end-lecture.describe"),
				type: "number",
				group: t("cli.args.groups.downloadOptions")
			},

			// Skip Options
			"skip-captions": {
				describe: t("cli.args.options.skip-captions.describe"),
				type: "boolean",
				group: t("cli.args.groups.skipOptions")
			},
			"skip-assets": {
				describe: t("cli.args.options.skip-assets.describe"),
				type: "boolean",
				group: t("cli.args.groups.skipOptions")
			},
			"skip-lectures": {
				describe: t("cli.args.options.skip-lectures.describe"),
				type: "boolean",
				group: t("cli.args.groups.skipOptions")
			},
			"skip-articles": {
				describe: t("cli.args.options.skip-articles.describe"),
				type: "boolean",
				group: t("cli.args.groups.skipOptions")
			},
			"skip-assignments": {
				describe: t("cli.args.options.skip-assignments.describe"),
				type: "boolean",
				group: t("cli.args.groups.skipOptions")
			}
		})
		.version(`Udemix ${(await getVersion()) ?? "Unknown"}`)
		.help()
		.alias("h", "help")
		.alias("v", "version")
		.wrap(null)
		.middleware((argv) => {
			if (argv.search && Array.isArray(argv.search)) {
				argv["combinedSearch"] = argv.search.join(" ").trim();
			}
		})
		.strict()
		.parse();

	if (argv.locale) {
		await changeLanguage(argv.locale);
	}

	if (!argv.url && !argv.id && !argv["combinedSearch"]) {
		log.error(t("cli.args.error.missingParameter"));
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
			captionType: argv["caption-type"] as "vtt" | "srt",
			locale: argv.locale
		}
	};

	return context;
}
