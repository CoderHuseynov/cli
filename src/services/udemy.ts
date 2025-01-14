import axios from "axios";
import type { UdemySearchCourse } from "@/models/udemy";
import { log } from "@/lib/logger";

const axiosInstance = axios.create({
	headers: {
		Accept: "application/json, text/plain, */*",
		"User-Agent": "curl/7.64.1",
		"Sec-Fetch-Dest": "empty",
		"Sec-Fetch-Mode": "cors",
		"Sec-Fetch-Site": "same-origin",
		"X-Requested-With": "XMLHttpRequest",
		"X-Udemy-Cache-Device": "None",
		"X-Udemy-Cache-Language": "en",
		"X-Udemy-Cache-Logged-In": "0",
		"X-Udemy-Cache-Marketplace-Country": "US",
		"X-Udemy-Cache-Price-Country": "US",
		"X-Udemy-Cache-User": "",
		"X-Udemy-Cache-Version": "1",
		Referer: "https://www.udemy.com/courses/search/?src=ukw&q=html",
		"Referrer-Policy": "strict-origin-when-cross-origin"
	},
	baseURL: "https://udemy.com/api-2.0/",
	timeout: 10000,
	// TODO: Use Cookie
	validateStatus: function (status) {
		return (status >= 200 && status < 300) || status === 404;
	}
});

export async function searchUdemyCourses(query: string, page: number = 1): Promise<UdemySearchCourse[]> {
	try {
		const courses = (
			await axiosInstance.get(
				`https://www.udemy.com/api-2.0/search-courses/?p=${page}&src=ukw&q=${query}&skip_price=true`
			)
		).data.courses;
		return courses as UdemySearchCourse[];
	} catch (error) {
		log.error(`Failed to search Udemy courses. ${(error as Error).message}`);
		process.exit(1);
	}
}
