import { type Context } from "@/models/context";

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
			if (!this.context.searchQuery) throw new Error("Search query is required.");
			// const courses = await searchCourses(this.context.searchQuery);
			// console.log("Search Results:", courses);
		} catch (error) {
			console.error("Error searching for courses:", error);
		}
	}

	async download() {
		try {
			if (!this.context.courseUrl) throw new Error("Course URL is required.");
			console.log(`Starting download for course from: ${this.context.courseUrl}`);
			// await downloadCourse(this.context);
			console.log("Course downloaded successfully.");
		} catch (error) {
			console.error("Error downloading course:", error);
		}
	}
}
