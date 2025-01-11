import type { Config } from "@/models/context";
import fs from "fs-extra";
import prompts from "prompts";
import { z } from "zod";

const configFilePath = "./config.json";

const configSchema: z.ZodType<Config> = z.object({
	cookiePath: z.string()
});

export async function loadConfig(config?: Config): Promise<Config> {
	let newConfig: Config = config || {};

	try {
		if (fs.existsSync(configFilePath)) {
			try {
				const configFile = await fs.readFile(configFilePath, "utf-8");
				newConfig = JSON.parse(configFile);
			} catch {
				const response = await prompts({
					type: "select",
					name: "action",
					message: "Config file is corrupted. What would you like to do?",
					choices: [
						{ title: "Overwrite the config", value: "overwrite" },
						{ title: "Exit", value: "exit" }
					]
				});

				if (response.action === "overwrite") {
					await fs.writeFile(configFilePath, JSON.stringify(newConfig, null, 2));
					return newConfig;
				}
				process.exit(1);
			}
		}

		if (config) {
			newConfig = {
				...newConfig,
				...Object.fromEntries(
					Object.entries(config).filter(([_, value]) => value !== null && value !== undefined)
				)
			};
		}
		const validation = configSchema.safeParse(newConfig);

		if (!validation.success) {
			console.error(validation.error.errors);
			process.exit(1);
		}

		await fs.promises.writeFile(configFilePath, JSON.stringify(newConfig, null, 2));
		return newConfig;
	} catch (error) {
		console.error("Error loading or validating config:", error);
		process.exit(1);
	}
}
