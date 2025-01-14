import { createLogger, format, transports, addColors } from "winston";
import "winston-daily-rotate-file";
import chalk from "chalk";
import * as path from "path";
import getAppDataPath from "appdata-path";

const { combine, timestamp, printf, colorize } = format;

const customLevels = {
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		verbose: 4,
		debug: 5,
		silly: 6
	},
	colors: {
		error: "red",
		warn: "yellow",
		info: "green",
		http: "magenta",
		verbose: "cyan",
		debug: "blue",
		silly: "grey"
	}
};

addColors(customLevels.colors);

const consoleFormat = printf(({ level, message, timestamp }) => `${chalk.gray(timestamp)} ${level}: ${message}`);
const fileFormat = printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`);

const logger = createLogger({
	levels: customLevels.levels,
	format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), fileFormat),
	transports: [
		new transports.Console({
			format: combine(colorize(), consoleFormat)
		}),
		new transports.DailyRotateFile({
			filename: path.join(getAppDataPath("udemix"), "logs", "%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			maxFiles: "14d",
			level: "info",
			format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), fileFormat),
			zippedArchive: true,
			auditFile: path.join(getAppDataPath("udemix"), "logs", "audit.json")
		})
	],
	exitOnError: false
});

export const log = logger;
