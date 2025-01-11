import type { Context } from "@/models/context";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export async function parseArgs(): Promise<Context> {
	const argv = await yargs(hideBin(process.argv))
		.option("cookie", {
			alias: "c",
			describe: "Path to the cookie file",
			type: "string"
		})
		.option("courseurl", {
			describe: "Course URL",
			type: "string"
		})
		.option("courseid", {
			describe: "Course ID",
			type: "string"
		})
		.help()
		.parse();

	if (!argv.courseurl && !argv.courseid) {
		console.error("Error: Either --courseUrl or --courseId is required.");
		process.exit(1);
	}

	const context: Context = {
		courseUrl: argv.courseurl,
		courseId: argv.courseid,
		config: {
			cookiePath: argv.cookie
		}
	};

	return context;
}
