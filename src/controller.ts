import { type Context } from "@/models/context";
import { searchUdemyCourses } from "./services/udemy";
import ora from "ora";
import prompts from "prompts";
import chalk from "chalk";

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
			if (!this.context.searchQuery) throw new Error("Failed to search: Search query is required.");
			const spinner = ora(`Searching for "${this.context.searchQuery}"`).start();
			const courses = await searchUdemyCourses(this.context.searchQuery);
			spinner.stop();

			if (courses.length === 0) {
				throw new Error(`No courses found for "${this.context.searchQuery}".`);
			}

			const courseChoices = courses.slice(0, 5).map((course, index) => ({
				title: `${index + 1}. ${chalk.green.bold(course.title)} - ${chalk.white(course.headline.replace(/<[^>]*>/g, ""))} (${!course.is_in_user_subscription && chalk.red("Not Subscribed")})\n`,
				value: course.id
			}));

			const response = await prompts({
				type: "select",
				name: "selectedCourseId",
				message: "Please select a course:",
				choices: courseChoices
			});

			this.context.courseId = response.selectedCourseId;
			this.context.courseUrl = courses.find((course) => course.id === response.selectedCourseId)?.url;
		} catch (error) {
			throw new Error(`Error searching for courses: ${(error as Error).message}`);
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
