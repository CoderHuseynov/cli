import type { UnixWebSocketServeOptions } from "bun";
import * as fs from "fs";
import { join } from "path";

export async function getVersion(): Promise<string> {
	const packagePath = join(__dirname, "../../package.json");
	const data = await fs.promises.readFile(packagePath, "utf-8");
	const packageJson = JSON.parse(data);
	return packageJson.version;
}

export async function isValidJsonCookie(path: string) {
	try {
		const parsed = JSON.parse(await fs.promises.readFile(path, "utf-8"));
		if (Array.isArray(parsed)) {
			return parsed.every(
				(cookieObj) =>
					cookieObj.hasOwnProperty("name") &&
					cookieObj.hasOwnProperty("value") &&
					cookieObj.hasOwnProperty("path")
			);
		} else if (typeof parsed === "object") {
			return parsed.hasOwnProperty("name") && parsed.hasOwnProperty("value") && parsed.hasOwnProperty("path");
		}
		return false;
	} catch (e) {
		return false;
	}
}

export async function isValidNetscapeCookie(path: string) {
	return (await fs.promises.readFile(path, "utf-8")).trim().startsWith("# Netscape HTTP Cookie File");
}

export const filterNullValues = (obj: object) =>
	Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null));
