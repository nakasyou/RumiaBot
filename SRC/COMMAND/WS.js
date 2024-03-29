import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import FS from "fs";
import { RUMI_HAPPY_BIRTHDAY } from "../MODULES/RUMI_HAPPY_BIRTHDAY.js";
import { CONFIG } from "../MODULES/CONFIG.js";
export class WS {
	constructor(INTERACTION) {
		this.E = INTERACTION;
	}

	async main() {
		let E = this.E;
		if (CONFIG.DISABLE?.includes("ws")) {
			return E.editReply("運営者の意向により、この機能は無効化されています！");
		}
		let REQUEST_URL = undefined;
		let BROWSER_NAME = E.options.getString("browser_name");
		let BROWSER_NAME_TEXT = "Chrome";

		if (E.options.getString("url").startsWith("http")) {
			REQUEST_URL = new URL(E.options.getString("url"));
		} else {
			REQUEST_URL = new URL("http://" + E.options.getString("url"));
		}

		//URLのポートが不正じゃないか
		if (!(REQUEST_URL.port === "80" || REQUEST_URL.port === "443" || REQUEST_URL.port === "")) {
			//なんでポート番号がURLになかったらStringNullなんだよしかもなんでStringなんだよ頭大丈夫か開発者
			E.editReply("ポート番号が不正です");
			return;
		}

		if (REQUEST_URL !== undefined && REQUEST_URL !== null) {
			try {
				//Chromeのオプションを設定
				const chromeOptions = new chrome.Options();
				chromeOptions.addArguments("--headless"); // ヘッドレスモードで実行
				chromeOptions.addArguments("--window-size=1980,1080"); // ウィンドウのサイズを設定

				if (BROWSER_NAME !== undefined && BROWSER_NAME !== null) {
					switch (BROWSER_NAME) {
						case "firefox":
							chromeOptions.addArguments("--user-agent=Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0");
							BROWSER_NAME_TEXT = "FireFox";
							break;
						case "floorp":
							chromeOptions.addArguments("--user-agent=Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Floorp/10.13.0");
							BROWSER_NAME_TEXT = "Floorp";
							break;
						case "rumisan":
							chromeOptions.addArguments("--user-agent=Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0 Rumisan/" + RUMI_HAPPY_BIRTHDAY() + ".0");
							BROWSER_NAME_TEXT = "るみさん";
							break;
						default:
							E.editReply("ブラウザ名が無効です");
							break;
					}
				}
				//WebDriverのインスタンスを作成
				const driver = new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();

				//ウェブサイトにアクセス
				driver
					.get(REQUEST_URL.toString())
					.then(() => {
						//スクリーンショットを撮影
						return driver.takeScreenshot();
					})
					.then(async screenshotData => {
						try {
							FS.writeFileSync("./DOWNLOAD/" + E.member.id + ".png", screenshotData, "base64");

							await E.editReply({
								content: "おｋ：" + BROWSER_NAME_TEXT + "で撮影",
								files: ["./DOWNLOAD/" + E.member.id + ".png"]
							});
							return;
						} catch (EX) {
							console.error("[ ERR ][ WebScreenShot ]", EX);
							E.editReply("接続できませんでした！" + EX);
							return;
						}
					})
					.catch(async () => {
						console.error("[ ERR ][ WebScreenShot ]", EX);
						await E.editReply("接続できませんでした！");
						//WebDriverを終了
						driver.quit();
						return;
					})
					.finally(() => {
						//WebDriverを終了
						driver.quit();
						return;
					});
			} catch (EX) {
				console.error("[ ERR ][ WebScreenShot ]", EX);
				await E.editReply("接続できませんでした！");
				return;
			}
		} else {
			await E.editReply("URLが指定されていません");
			return;
		}
	}
}
