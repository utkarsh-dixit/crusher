import { Page } from "playwright";
import { iAction } from "@crusher-shared/types/action";

export default async function navigateUrl(action: iAction, page: Page) {
	return new Promise(async (success, error) => {
		try {
			const urlToGo = action.payload.meta.value;

			await page.goto(urlToGo);

			return success({
				message: `Navigated successfully to ${urlToGo}`,
			});
		} catch (err) {
			console.error(err);
			return error("Some issue occurred while navigating to webpage");
		}
	});
}
