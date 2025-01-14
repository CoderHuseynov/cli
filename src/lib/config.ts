import type { Config } from "@/models/context";
import * as fs from "fs";
import * as path from "path";
import prompts from "prompts";
import { z } from "zod";
import { log } from "./logger";
import { filterNullValues, isValidJsonCookie, isValidNetscapeCookie } from "./utils";
import chalk from "chalk";
import getAppDataPath from "appdata-path";
import { t } from "./i18n";

const configDirPath = getAppDataPath("udemix");
const configFilePath = path.join(configDirPath, "config.json");

const configSchema: z.ZodType<Config> = z.object({
	cookiePath: z.string(),
	concurrent: z.number().min(1),
	cookieType: z.enum(["json", "netscape"]).optional(),
	skipCaptions: z.boolean(),
	skipAssets: z.boolean(),
	skipLectures: z.boolean(),
	skipArticles: z.boolean(),
	skipAssignments: z.boolean(),
	captionType: z.enum(["vtt", "srt"]).optional(),
	locale: z.string().default("en")
});

const defaultConfig: Config = {
	concurrent: 4,
	cookieType: "json",
	skipCaptions: false,
	skipAssets: false,
	skipLectures: false,
	skipArticles: false,
	skipAssignments: false,
	captionType: "vtt",
	locale: "en"
};

export async function readConfigFile(): Promise<Config | undefined> {
	try {
		const configFile = await fs.promises.readFile(configFilePath, "utf-8");
		return JSON.parse(configFile);
	} catch (error) {
		if ((error as any).code === "ENOENT") {
			log.info(t("cli.info.configFileNotFound", { configFilePath }));
			return {};
		}
		log.error(t("cli.errors.readConfigFile", { error }));
	}
}

async function handleCorruptedConfig(): Promise<void> {
	const response = await prompts({
		type: "select",
		name: "action",
		message: t("cli.info.overwriteConfig"),
		choices: [
			{ title: t("cli.info.corruptedConfigAction"), value: "overwrite" },
			{ title: t("cli.info.exitAction"), value: "exit" }
		]
	});

	if (response.action === "exit") process.exit(1);
}

async function validateCookiePath(cookiePath: string): Promise<{ path: string; type: "json" | "netscape" }> {
	try {
		await fs.promises.access(cookiePath);

		const isValidJson = await isValidJsonCookie(cookiePath);
		if (!isValidJson && !(await isValidNetscapeCookie(cookiePath))) {
			log.error(t("cli.errors.invalidCookieFormat"));
			process.exit(1);
		}

		const fullPath = path.isAbsolute(cookiePath) ? cookiePath : path.join(process.cwd(), cookiePath);

		return {
			path: fullPath,
			type: isValidJson ? "json" : "netscape"
		};
	} catch {
		log.error(t("cli.errors.invalidCookiePath"));
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
			log.error(t("cli.errors.noCookieProvided"));
			process.exit(1);
		}

		const { path, type } = await validateCookiePath(newConfig.cookiePath);
		newConfig.cookiePath = path;
		newConfig.cookieType = type;

		const validation = configSchema.safeParse(newConfig);
		if (!validation.success) {
			validation.error?.issues.forEach((error) => {
				log.error(
					t("cli.errors.configValidationFailed", {
						path: chalk.magenta.bold(error.path.join("")),
						// @ts-ignore
						expected: chalk.green(error.expected),
						message: chalk.yellow(error.message)
					})
				);
			});
			process.exit(1);
		}

		if (newConfig.concurrent !== undefined && newConfig.concurrent > 15) {
			log.warn(t("cli.warn.concurrentLimit"));
		}

		try {
			await fs.promises.access(configDirPath, fs.constants.F_OK);
		} catch (err) {
			await fs.promises.mkdir(configDirPath, { recursive: true });
		}

		await fs.promises.writeFile(configFilePath, JSON.stringify(newConfig, null, 2));
		return newConfig;
	} catch (error) {
		log.error(t("cli.errors.readConfigFile", { error }));
		process.exit(1);
	}
}
