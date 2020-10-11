// @ts-ignore
import {ElementHandle} from "playwright/types/types";
import {JobPlatform} from "../interfaces/JobPlatform";
import {TEST_LOGS_SERVICE_TAGS, TestLogsService} from "../services/mongo/testLogs";

// @ts-ignore
const { Page } = require('playwright/lib/page');
// @ts-ignore
const {ElementHandle} = require('playwright/lib/dom');
const md5 = require("md5");
import {Page} from "playwright";

let {saveVideo: saveVideoPlaywright} = require("playwright-video");

require('playwright');
let state : any = {platform: JobPlatform.CHROME, isRecordingVideo: false};

export function setTestData(instanceId: number, _jobInfo: any, _testInfo: any, _platform: string){
    state = {instanceId, jobInfo: _jobInfo, testInfo: _testInfo, platform: _platform};
}

Page.prototype._screenshot = Page.prototype.screenshot;
Page.prototype._click = Page.prototype.click;
Page.prototype._goto = Page.prototype.goto;
Page.prototype._hover = Page.prototype.hover;
ElementHandle.prototype._screenshot = ElementHandle.prototype.screenshot;

export const saveVideo = function (
    page: Page,
    savePath: string,
    options?: any,
){
    console.log("Starting recording video for draft");
    return new Promise(async (resolve, reject)=>{
        const pageVideoCapture = await saveVideoPlaywright(page,`/tmp/video/${state.instanceId}/${state.platform}/${state.testInfo.id}.mp4`, options);
        state = {...state, pageVideoCapture, isRecordingVideo: true};
        return resolve(pageVideoCapture);
    });
}

Page.prototype.goto = async function (url: string, options?: any){
    const testLogsService = new TestLogsService();
    testLogsService.init(state.testInfo.id, state.instanceId, state.testInfo.testType, state.jobInfo ? state.jobInfo.id : -1);
    // await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.NAVIGATE_PAGE, `Starting navigation to ${url}`);
    const gotoOut = await this._goto(url, options);
    await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.NAVIGATE_PAGE, `Navigated page to ${url}`);

    return gotoOut;
}

Page.prototype.screenshot = async function (options? : any){
    const {path} = options;
    let imageName = path ? path.trim() : "";
    imageName = md5(imageName) + ".png";

    const testLogsService = new TestLogsService();
    testLogsService.init(state.testInfo.id, state.instanceId, state.testInfo.testType, state.jobInfo ? state.jobInfo.id : -1);
    // console.log(`Saving page screenshot to /tmp/images/${state.instanceId}/${state.platform}/${imageName}`);
    // await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.PAGE_SCREENSHOT, `Saving page screenshot to /tmp/images/${state.instanceId}/${state.platform}/${imageName}`);

    const screenshotOut = await this._screenshot({...options, path: `/tmp/images/${state.instanceId}/${state.platform}/${imageName}`});

    await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.PAGE_SCREENSHOT, `Saved page screenshot to /tmp/images/${state.instanceId}/${state.platform}/${imageName}`);

    return screenshotOut;
};

ElementHandle.prototype.screenshot = async function(options? : any){
    const {path} = options;
    let imageName = path ? path.trim() : "";
    imageName = md5(imageName) + ".png";
    const testLogsService = new TestLogsService();
    testLogsService.init(state.testInfo.id, state.instanceId, state.testInfo.testType, state.jobInfo ? state.jobInfo.id : -1);
    // console.log(`Saving element screenshot to /tmp/images/${state.instanceId}/${state.platform}/${imageName}`);
    // await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.ELEMENT_SCREENSHOT, `Start capturing element screenshot to /tmp/images/${state.instanceId}/${state.platform}/${imageName}`);

    const screenshotOut = await this._screenshot({...options, path: `/tmp/images/${state.instanceId}/${state.platform}/${imageName}`});;

    await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.ELEMENT_SCREENSHOT, `Captured element screenshot to /tmp/images/${state.instanceId}/${state.platform}/${imageName}`);

    return screenshotOut;
}

Page.prototype.click = async function(selector: string, options?: any){
    const testLogsService = new TestLogsService();
    testLogsService.init(state.testInfo.id, state.instanceId, state.testInfo.testType, state.jobInfo ? state.jobInfo.id : -1);

    // console.log(`Performing a click on ${selector}...`);
    // await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.ELEMENT_CLICK, `Performing a click on ${selector}...`);

    const clickOut = await this._click(selector, options);

    await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.ELEMENT_CLICK, `Clicked on ${selector}`);

    return clickOut;
}
Page.prototype.hover = async function(selector: string, options?: any){
    const testLogsService = new TestLogsService();
    testLogsService.init(state.testInfo.id, state.instanceId, state.testInfo.testType, state.jobInfo ? state.jobInfo.id : -1);

    // console.log(`Performing a hover on ${selector}`);
    // await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.ELEMENT_HOVER, `Performing hover on ${selector}`);
    const hoverOut = await this._hover(selector, options);

    await testLogsService.notify(TEST_LOGS_SERVICE_TAGS.ELEMENT_HOVER, `Hovered on ${selector}`);

    return hoverOut;
}

export const chromium = {
    launch: function(options: any = {}){
        const playwright = require('playwright');
        return playwright["chromium"].launch({...options, args: [...(options.args ? options.args : []),'--no-sandbox', '--disable-setuid-sandbox']});
    }
};

export const chrome = chromium;

export const firefox = {
    launch: function(options: any = {}){
        const playwright = require('playwright');
        return playwright["firefox"].launch({...options});
    }
};

export const webkit = {
    launch: function(options: any = {}){
        const playwright = require('playwright');
        return playwright["webkit"].launch({...options});
    }
};

export const safari = webkit;


function getPlatformHandler(platformName: string){
    if(!platformName) return null;
    switch(platformName.toLowerCase()){
        case "chrome":
            return chromium;
        case "chromium":
            return chromium;
        case "safari":
            return safari;
        case "webkit":
            return safari;
        case "firefox":
            return firefox;
        default:
            return null;
    }
}

/*
    This function is exported because it is used by code run by
    CodeRunnerService to start our wrapper which records actions in
    logs and videos which is saved later in the database.

    It also replaces the provided platform if specified by RunJobRequest.
 */
export function boot(platform: string){
    const platformToReplace = getPlatformHandler(platform);
    return {
        chromium: platformToReplace ? platformToReplace : chromium,
        chrome: platformToReplace ? platformToReplace : chrome,
        firefox: platformToReplace ? platformToReplace : firefox,
        webkit: platformToReplace ? platformToReplace : webkit,
        safari: platformToReplace ? platformToReplace : safari
    }
}