export interface UdemySearchCourse {
	id: number;
	title: string;
	headline: string;
	rating: number;
	hrs_of_content_f: string;
	url: string;
	is_in_user_subscription: boolean;
}

export interface UdemyCourse {
	_class: string;
	title: string;
	url: string;
	is_paid: boolean;
	price: string;
	price_detail: null;
	price_serve_tracking_id: string;
	visible_instructors: {
		_class: string;
		id: number;
		title: string;
		name: string;
		display_name: string;
		job_title: string;
		image_50x50: string;
		image_100x100: string;
		initials: string;
		url: string;
	}[];
	image_125_H: string;
	image_240x135: string;
	is_practice_test_course: boolean;
	image_480x270: string;
	published_title: string;
	tracking_id: string;
	locale: {
		_class: string;
		locale: string;
		title: string;
		english_title: string;
		simple_english_title: string;
	};
}
