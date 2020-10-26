import { JobInfo } from "@interfaces/JobInfo";
import {
	ADD_COMMENT_TO_SCREENSHOT,
	SET_CURRENT_JOB_INFO,
	SET_CURRENT_JOB_PLATFORM,
} from "@redux/actions/job";

const initialState = {
	platform: "CHROME",
	job: null,
	referenceJob: null,
	comments: {},
	instances: {},
	results: {},
};

const job = (state = initialState, action) => {
	switch (action.type) {
		case SET_CURRENT_JOB_INFO:
			return {
				...state,
				job: action.job,
				referenceJob: action.referenceJob,
				comments: action.comments,
				instances: action.instances,
				results: action.results,
			};
			break;
		case ADD_COMMENT_TO_SCREENSHOT:
			return {
				...state,
				comments: {
					...state.comments,
					[action.comment.instance_id]: {
						...(state.comments[action.comment.instance_id]
							? state.comments[action.comment.instance_id]
							: {}),
						[action.comment.screenshot_id]: [
							...(state.comments[action.comment.instance_id] &&
							state.comments[action.comment.instance_id][action.comment.screenshot_id]
								? state.comments[action.comment.instance_id][
										action.comment.screenshot_id
								  ]
								: []),
							{
								id: action.comment.id,
								user_id: action.comment.user_id,
								user_first_name: action.comment.user_first_name,
								user_last_name: action.comment.user_last_name,
								job_id: action.comment.job_id,
								instance_id: action.comment.instance_id,
								screenshot_id: action.comment.screenshotId,
								result_set_id: action.comment.result_set_id,
								message: action.comment.message,
								created_at: new Date().toString(),
							},
						],
					},
				},
			};
			break;
		case SET_CURRENT_JOB_PLATFORM:
			return {
				...state,
				platform: action.platform,
			};
			break;
		default:
			return state;
	}
};

export default job;