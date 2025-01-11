import i18next, { type i18n } from "i18next";
import Backend from "i18next-fs-backend";
import path from "node:path";

i18next.use(Backend).init({
	lng: "en",
	fallbackLng: "en",
	backend: {
		loadPath: path.join(__dirname, "locales", "{{lng}}.json")
	}
});

export { i18next, type i18n };
