import { type Context } from "@/models/context";
import { searchUdemyCourses } from "./services/udemy";
import ora from "ora";
import prompts from "prompts";
import chalk from "chalk";
import { t } from "./lib/i18n";

export class UdemyController {
	private context: Context;

	constructor(context: Context) {
		this.context = context;
	}

	async getCourse() {
		try {
			if (!this.context.courseId) throw new Error("Course ID is required.");
			// const courseInfo = await getCourseInfo(this.context.courseId);
			// console.log("Course Info:", courseInfo);
		} catch (error) {
			console.error("Error getting course info:", error);
		}
	}

	async search() {
		try {
			if (!this.context.searchQuery) {
				throw new Error(t("udemy.search.error.searchQueryRequired"));
			}

			const spinner = ora(t("udemy.search.message.searching", { searchQuery: this.context.searchQuery })).start();
			const courses = await searchUdemyCourses(this.context.searchQuery);
			spinner.stop();

			if (courses.length === 0) {
				throw new Error(t("udemy.search.error.noCoursesFound", { searchQuery: this.context.searchQuery }));
			}

			const courseChoices = courses.slice(0, 5).map((course, index) => ({
				title: `${index + 1}. ${chalk.green.bold(course.title)} - ${chalk.white(course.headline.replace(/<[^>]*>/g, ""))} (${!course.is_in_user_subscription && chalk.red(t("udemy.search.error.noSubscription"))})\n`,
				value: course.id
			}));

			const response = await prompts({
				type: "select",
				name: "selectedCourseId",
				message: t("udemy.search.message.selectCourse"),
				choices: courseChoices
			});

			if (!response.selectedCourseId) process.exit(0);

			this.context.courseId = response.selectedCourseId;
			this.context.courseUrl = courses.find((course) => course.id === response.selectedCourseId)?.url;
		} catch (error) {
			throw new Error(t("udemy.search.error.searchingFailed", { errorMessage: (error as Error).message }));
		}
	}

	async download() {
		try {
			// if (!this.context.courseUrl) throw new Error("Course URL is required.");
			console.log(`Starting download for course from: ${this.context.courseUrl}`);
			// await downloadCourse(this.context);
			console.log("Course downloaded successfully.");
		} catch (error) {
			console.error("Error downloading course:", error);
		}
	}
}
