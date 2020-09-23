import path from "path";
import Setting from "../config/Setting";
export default function initSetting(): Setting {
	const root = require.main ? require.main.path : "../../";
	const settingPath = path.resolve(root, "./setting.ts");
	try {
		const UserSetting = require(settingPath);
		return new UserSetting.default();
	} catch (e) {
		console.log("can't find setting file or your setting file is not correct, server will use default setting");
		console.log("notice: this means no data server is accessible");
		return new Setting();
	}
}
