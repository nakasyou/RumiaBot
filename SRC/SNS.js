import { CONFIG } from "./MODULES/CONFIG.js";
import { MessageEmbed } from "discord.js";
import { RND_COLOR } from "./MODULES/RND_COLOR.js";
import { MSG_SEND } from "./MODULES/MSG_SEND.js";
import { client } from "./MODULES/loadClient.js";
import { WebSocket } from "ws";
import { SQL_OBJ } from "./Main.js";

export class SNS {
	constructor() {
		this.USER = [];
	}

	//SQLを再読込するやつ
	SQL_RELOAD() {
		//VSCさ、勝手にコード変えるのまじでやめてくれん？
		SQL_OBJ.SCRIPT_RUN("SELECT * FROM `SNS`; ", [])
			.then(RESULT => {
				this.USER = RESULT;
			})
			.catch(EX => {
				console.log("[ OK ][ MISSKEY ]SQL ERR:" + EX);
			});
	}

	//ごちゃごちゃ
	main() {
		this.SQL_RELOAD();

		CONFIG.SNS.forEach(ROW => {
			this.misskey(ROW.DOMAIN, ROW.API, ROW.ID);
		});
	}

	misskey(DOMAIN, API_TOKEN, ID) {
		//WebSocketサーバーのURL
		const serverURL = "wss://" + DOMAIN + "/streaming?i=" + API_TOKEN;

		//WebSocket接続を作成
		const socket = new WebSocket(serverURL);

		//接続が確立された際のイベントハンドラ
		socket.on("open", () => {
			console.log("[ OK ][ MISSKEY ]WS Connected!");

			//メッセージをサーバーに送信
			socket.send('{"type":"connect","body":{"channel":"localTimeline","id":"1","params":{"withReplies":false}}}');
		});

		//サーバーからメッセージを受信した際のイベントハンドラ
		socket.on("message", DATA => {
			try {
				const RESULT = JSON.parse(DATA);
				if (RESULT.body.type === "note") {
					//投稿者のID
					let IT_MIS_USER = RESULT.body.body.user;
					//SQLにそのIDがあるか探す
					let IT_DIS_USER = this.USER.find(ROW => ROW.SNS_UID === IT_MIS_USER.id && ROW.SNS_ID === ID);

					//Ej! そのIDはあるか？？？
					if (IT_DIS_USER) {
						let NOTE_ID = RESULT.body.body.id; //ノートのID
						let NOTE_TEXT = RESULT.body.body.text; //ノートのテキスト
						let NOTE_FILES = RESULT.body.body.files; //ノートのファイル
						let RENOTE_ID = RESULT.body.body.renoteId; //リノートのID
						let RENOTE_NOTE = RESULT.body.body.renote; //リノートのデータ

						console.log("[ INFO ][ MISSKEY ]Note res:" + NOTE_ID); //ログを吐く

						const EB = new MessageEmbed();
						//ユーザー名
						EB.setTitle(IT_MIS_USER.name);

						//本文
						if (NOTE_TEXT !== undefined && NOTE_TEXT !== null) {
							//本文が有るか
							//ある
							EB.setDescription(NOTE_TEXT);
						}

						//色
						EB.setColor(RND_COLOR());

						//URL
						EB.setURL("https://ussr.rumiserver.com/@" + IT_MIS_USER.id);

						if (NOTE_FILES.length !== 0) {
							if (!NOTE_FILES[0].isSensitive) {
								EB.setImage(NOTE_FILES[0].thumbnailUrl);
							}
						}

						//リノート関連
						if (RENOTE_ID !== null) {
							//リノートはあるか
							//あるのでリノート元を貼る
							if (RENOTE_NOTE.text !== undefined && RENOTE_NOTE.text !== null && RENOTE_NOTE.text !== "") {
								EB.addFields({
									name: "リノート元\n" + RENOTE_NOTE.user.name,
									value: RENOTE_NOTE.text,
									inline: false
								});
							} else {
								EB.addFields({
									name: "リノート元\n" + RENOTE_NOTE.user.name,
									value: "[テキストナシ]",
									inline: false
								});
							}

							//リノートじの画像
							if (NOTE_FILES.length === 0) {
								//既に画像が有るか
								//リノート元に画像は有るか
								if (RENOTE_NOTE.files !== 0) {
									if (!RENOTE_NOTE.files[0].isSensitive) {
										EB.setImage(RENOTE_NOTE.files[0].thumbnailUrl);
									}
								}
							}
						}

						// アクション
						EB.addFields({
							name: "ｱクション",
							value: "[見に行く](https://" + DOMAIN + "/notes/" + NOTE_ID + ")|" + "[何もしない](https://google.com)",
							inline: false
						});

						//そのまま送りつける
						MSG_SEND(client, IT_DIS_USER.GID, IT_DIS_USER.CID, { embeds: [EB] });
					}
				}
			} catch (EX) {
				console.log("[ ERR ][ MISSKEY ]" + EX);
				return;
			}
		});

		//エラー発生時のイベントハンドラ
		socket.on("error", ERR => {
			console.error("エラーが発生しました:", ERR);
		});

		//接続が閉じられた際のイベントハンドラ
		socket.on("close", (CODE, REASON) => {
			console.log("[ INFO ][ MISSKEY ]Disconnected!" + CODE + "REASON:" + REASON);
			console.log("[ *** ][ MISSKEY ]Re Connecting...");
			clearInterval(SEND_H);
			this.main(); //再接続する
		});

		let SEND_H = setInterval(() => {
			socket.send("h");
		}, 60000);
	}
}