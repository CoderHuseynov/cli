/**
 * @file index.ts
 * @description Entry point for the JavaScript/TypeScript version of the "udemy-py" project.
 *              This project is a downloader and course management tool for Udemy,
 *              migrated from its original Python implementation to a JavaScript/TypeScript stack.
 * @project Udemix CLI
 * @author Swargaraj
 * @license MIT
 * @created 2025-01-11
 *
 * @notes
 * - The original Python codebase served as the foundation for this project.
 * - Key features include course downloading, queue management, and moderation of banned users.
 * - This version uses modern JavaScript/TypeScript tools and frameworks for scalability and performance.
 */

import { parseArgs } from "@/lib/cli";
import { loadConfig } from "@/lib/config";
import { UdemyController } from "@/controller";
import { log } from "./lib/logger";
import { initializeI18n } from "./lib/i18n";

await initializeI18n();

const context = await parseArgs();
context.config = await loadConfig(context.config);

const controller = new UdemyController(context);

try {
	if (context.searchQuery) await controller.search();
	await controller.download();
} catch (error) {
	log.error((error as Error).message);
}
