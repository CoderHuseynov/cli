import i18next, { type i18n } from "i18next";
import Backend from "i18next-fs-backend";
import path from "node:path";
import { readConfigFile } from "./config";
import { log } from "./logger";

i18next.use(Backend).init({
	fallbackLng: "en",
	backend: {
		loadPath: path.join(__dirname, "locales", "{{lng}}.json")
	}
});

export async function initializeI18n() {
	const config = await readConfigFile();
	const locale = config?.locale || "en";

	await i18next.init();

	if (locale && i18next.languages.includes(locale)) {
		await i18next.changeLanguage(locale);
	} else {
		i18next.language = "en";
		log.warn(
			`Invalid locale provided in config file: ${locale}. Falling back to English. Available locales are: ${i18next.languages.join(
				", "
			)}.`
		);
	}
}

export async function changeLanguage(locale: string) {
	if (i18next.languages.includes(locale)) {
		await i18next.changeLanguage(locale);
	} else {
		log.warn(
			t("cli.warn.unsupportedLanguage", {
				locale,
				availableLocales: i18next.languages.join(", ")
			})
		);
	}
}

const t = i18next.t;
export { t, type i18n };
