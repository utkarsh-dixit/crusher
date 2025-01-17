const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const BIN_DIR = path.resolve(__dirname, "../bin");
const celectronRegExp = new RegExp(/^celectron-v([\d.]+)-(linux|darwin)-x64.zip/);

function extractZipIfNotThere(binaryZipInfoArr) {
	const platforms = Object.keys(binaryZipInfoArr);

	console.log("Extracting binaries now...");

	for (let platform of platforms) {
		if (fs.existsSync(path.resolve(BIN_DIR, platform))) {
			console.log(`Binaries already extracted for ${platform}. Skipping...`);
			break;
		}
		const zip = new AdmZip(binaryZipInfoArr[platform].path);
		zip.extractAllTo(path.resolve(BIN_DIR, platform), true);

		fs.unlinkSync(binaryZipInfoArr[platform].path);
	}
}

function init() {
	if (fs.existsSync(path.resolve(BIN_DIR, "linux")) && fs.existsSync(path.resolve(BIN_DIR, "darwin"))) {
		console.log("Binaries are already downloaded and extracted. Skipping...");
		return;
	}

	fs.mkdirSync(BIN_DIR, { recursive: true });

	const entries = fs.readdirSync(BIN_DIR, { withFileTypes: true });
	const binaryZipEntries = entries.filter((entry) => entry.isFile() && entry.name.match(celectronRegExp));
	const binaryZipsInfo = binaryZipEntries.reduce((prev, zipEntry) => {
		const regexGroups = zipEntry.name.match(celectronRegExp);
		const platformName = regexGroups[2];
		return { ...prev, [platformName]: { path: path.resolve(BIN_DIR, regexGroups[0]), version: regexGroups[1], platform: platformName } };
	}, {});

	extractZipIfNotThere(binaryZipsInfo);
}

init();
