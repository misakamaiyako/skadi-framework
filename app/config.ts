import path from "path";
import Setting from "../config/Setting";
export default function initSetting(): Setting {
	const settingPath = path.resolve(__dirname, "../../setting.json");
	try {
		const UserSetting = require(settingPath);
		return new UserSetting();
	} catch (e) {
		console.log("can't find setting file or your setting file is not correct, server will use default setting");
		console.log("notice: this means no data server is accessible");
		return new Setting();
	}
}
