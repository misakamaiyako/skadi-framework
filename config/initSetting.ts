import globalSetting from "./GlobalSetting";
import path from "path";
import Setting from "./Setting";
export default function initSetting() {
	const settingPath = path.resolve(__dirname, "../setting.json");
	try {
		const UserSetting = require(settingPath);
		globalSetting.setting = new UserSetting();
	} catch (e) {
		console.log("can't find setting file or your setting file is not correct, server will use default setting");
		console.log("notice: this means no data server is accessible");
		globalSetting.setting = new Setting();
	}
}
