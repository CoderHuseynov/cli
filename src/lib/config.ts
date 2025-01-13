import type { Config } from "@/models/context";
import * as fs from "fs";
import * as path from "path";
import prompts from "prompts";
import { z } from "zod";
import { log } from "./logger";
import { filterNullValues, isValidJsonCookie, isValidNetscapeCookie } from "./utils";
import chalk from "chalk";
import getAppDataPath from "appdata-path";

const configFilePath = path.join(getAppDataPath("udemix"), "config.json");
const configDirPath = path.dirname(configFilePath);

const configSchema: z.ZodType<Config> = z.object({
	cookiePath: z.string(),
	concurrent: z.number().min(1),
	cookieType: z.enum(["json", "netscape"]).optional(),
	skipCaptions: z.boolean(),
	skipAssets: z.boolean(),
	skipLectures: z.boolean(),
	skipArticles: z.boolean(),
	skipAssignments: z.boolean(),
	captionType: z.enum(["vtt", "srt"]).optional()
});

const defaultConfig: Config = {
	concurrent: 4,
	cookieType: "json",
	skipCaptions: false,
	skipAssets: false,
	skipLectures: false,
	skipArticles: false,
	skipAssignments: false,
	captionType: "vtt"
};

async function readConfigFile(): Promise<Config | undefined> {
	try {
		const configFile = await fs.promises.readFile(configFilePath, "utf-8");
		return JSON.parse(configFile);
	} catch (error) {
		if ((error as any).code === "ENOENT") {
			log.info(`Config file not found. Creating a new one at ${configFilePath}`);
			return {};
		}
		log.error("Error reading config file:", error);
	}
}

async function handleCorruptedConfig(): Promise<void> {
	const response = await prompts({
		type: "select",
		name: "action",
		message: "Config file is corrupted. What would you like to do?",
		choices: [
			{ title: "Overwrite the config", value: "overwrite" },
			{ title: "Exit", value: "exit" }
		]
	});

	if (response.action === "exit") process.exit(1);
}

async function validateCookiePath(cookiePath: string): Promise<{ path: string; type: "json" | "netscape" }> {
	try {
		await fs.promises.access(cookiePath);

		const isValidJson = await isValidJsonCookie(cookiePath);
		if (!isValidJson && !(await isValidNetscapeCookie(cookiePath))) {
			log.error("Invalid cookie format: The cookie must be in either JSON or Netscape format.");
			process.exit(1);
		}

		const fullPath = path.isAbsolute(cookiePath) ? cookiePath : path.join(process.cwd(), cookiePath);

		return {
			path: fullPath,
			type: isValidJson ? "json" : "netscape"
		};
	} catch {
		log.error("Invalid cookie path: The specified cookie path does not exist.");
		process.exit(1);
	}
}

export async function loadConfig(config?: Config): Promise<Config> {
	let newConfig: Config = defaultConfig;

	try {
		const existingConfig = await readConfigFile();

		if (!existingConfig || existingConfig === null) {
			await handleCorruptedConfig();
			newConfig = {
				...newConfig,
				...(config ? filterNullValues(config) : {})
			};
		} else {
			newConfig = {
				...newConfig,
				...filterNullValues(existingConfig),
				...(config ? filterNullValues(config) : {})
			};
		}

		if (!newConfig.cookiePath) {
			log.error(
				"No cookie provided: Use '--cookie' to specify the path to a valid cookie file for authentication."
			);
			process.exit(1);
		}

		const { path, type } = await validateCookiePath(newConfig.cookiePath);
		newConfig.cookiePath = path;
		newConfig.cookieType = type;

		const validation = configSchema.safeParse(newConfig);
		if (!validation.success) {
			validation.error?.issues.forEach((error) => {
				log.error(
					// @ts-ignore
					`Configuration validation failed: ${chalk.magenta.bold(error.path.join(""))} Expected: ${chalk.green(error.expected)}, Message: ${chalk.yellow(error.message)}`
				);
			});
			process.exit(1);
		}

		if (newConfig.concurrent !== undefined && newConfig.concurrent > 15) {
			log.warn("Using more than 15 concurrent downloads may impact performance.");
		}

		try {
			await fs.promises.access(configDirPath, fs.constants.F_OK);
		} catch (err) {
			await fs.promises.mkdir(configDirPath, { recursive: true });
		}

		await fs.promises.writeFile(configFilePath, JSON.stringify(newConfig, null, 2));
		return newConfig;
	} catch (error) {
		log.error("Error loading or validating config:", error);
		process.exit(1);
	}
}
