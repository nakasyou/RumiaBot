import { client } from "../MODULES/loadClient.js";
import { MessageEmbed } from "discord.js";
import { NULLCHECK } from "../MODULES/NULLCHECK.js";
import { RND_COLOR } from "../MODULES/RND_COLOR.js";

export class INFO {
	constructor(INTERACTION) {
		this.E = INTERACTION;
	}

	//鯖情報取得
	async sv_main() {
		let E = this.E;
		const GLID = client.guilds.cache.get(E.guildId);

		const EB = new MessageEmbed();
		EB.setTitle(NULLCHECK(GLID.name));
		EB.setDescription(NULLCHECK(GLID.description));
		EB.setColor(RND_COLOR());

		EB.setThumbnail("https://cdn.discordapp.com/icons/" + GLID.id + "/" + GLID.icon + ".png");

		//鯖のID
		EB.addFields({
			name: "ID",
			value: NULLCHECK(GLID.id),
			inline: false
		});

		//認証レベル
		EB.addFields({
			name: "verificationLevel",
			value: NULLCHECK(GLID.verificationLevel),
			inline: false
		});

		//鯖のオーナー
		const OWNER = client.users.cache.get(GLID.ownerId);
		EB.addFields({
			name: "所有者",
			value: NULLCHECK(OWNER.name),
			inline: false
		});

		await E.editReply({ embeds: [EB] });
	}

	//ユーザー情報取得
	async usr_main() {
		let E = this.E;

		const MEMBER = E.options.getMentionable("user");
		const USER = client.users.cache.get(E.options.getMentionable("user").user.id);

		let NOW_DATE = new Date();
		const DAY_FORMAT = ["日", "月", "火", "水", "木", "金", "土"];

		//埋め込み
		const EB = new MessageEmbed();

		//ユーザー名
		if (MEMBER.nickname !== undefined && MEMBER.nickname !== null) {
			EB.setTitle(NULLCHECK(MEMBER.nickname));
		} else {
			EB.setTitle(NULLCHECK(USER.username));
		}

		EB.setDescription(NULLCHECK(USER.username));
		EB.setColor(RND_COLOR());

		EB.setThumbnail("https://cdn.discordapp.com/avatars/" + USER.id + "/" + USER.avatar + ".png");

		EB.addFields({
			name: "ID",
			value: NULLCHECK(USER.id),
			inline: false
		});

		//アカウント作成日
		const ACCOUNT_CREATE_DATE = new Date(USER.createdAt);
		EB.addFields({
			name: "アカウント作成日",
			//日本表記
			value:
				ACCOUNT_CREATE_DATE.getFullYear().toString() +
				"年 " +
				(ACCOUNT_CREATE_DATE.getMonth() + 1).toString() +
				"月 " +
				ACCOUNT_CREATE_DATE.getDate().toString() +
				"日 " +
				DAY_FORMAT[ACCOUNT_CREATE_DATE.getDay()] +
				"曜日 " +
				ACCOUNT_CREATE_DATE.getHours().toString() +
				"時 " +
				ACCOUNT_CREATE_DATE.getMinutes().toString() +
				"分 " +
				ACCOUNT_CREATE_DATE.getSeconds().toString() +
				"秒 " +
				ACCOUNT_CREATE_DATE.getMilliseconds().toString() +
				"ミリ秒\n" +
				//アメリカ表記
				Math.floor((NOW_DATE - ACCOUNT_CREATE_DATE) / (1000 * 60 * 60 * 24)).toString() +
				"日前",
			inline: false
		});

		//鯖に参加した日付
		const GUILD_JOIN_DATE = new Date(MEMBER.joinedAt);
		EB.addFields({
			name: "鯖に参加した日付",
			//日本表記
			value:
				GUILD_JOIN_DATE.getFullYear().toString() +
				"年 " +
				(GUILD_JOIN_DATE.getMonth() + 1).toString() +
				"月 " +
				GUILD_JOIN_DATE.getDate().toString() +
				"日 " +
				DAY_FORMAT[GUILD_JOIN_DATE.getDay()] +
				"曜日 " +
				GUILD_JOIN_DATE.getHours().toString() +
				"時 " +
				GUILD_JOIN_DATE.getMinutes().toString() +
				"分 " +
				GUILD_JOIN_DATE.getSeconds().toString() +
				"秒 " +
				GUILD_JOIN_DATE.getMilliseconds().toString() +
				"ミリ秒\n" +
				//アメリカ表記
				Math.floor((NOW_DATE - GUILD_JOIN_DATE) / (1000 * 60 * 60 * 24)).toString() +
				"日前",
			inline: false
		});

		//ニトロブースト開始日
		if (MEMBER.premiumSince !== undefined && MEMBER.premiumSince !== null) {
			const GUILD_JOIN_DATE = new Date(MEMBER.joinedAt);
			EB.addFields({
				name: "ブースト開始日",
				//日本表記
				value:
					GUILD_JOIN_DATE.getFullYear().toString() +
					"年 " +
					(GUILD_JOIN_DATE.getMonth() + 1).toString() +
					"月 " +
					GUILD_JOIN_DATE.getDate().toString() +
					"日 " +
					DAY_FORMAT[GUILD_JOIN_DATE.getDay()] +
					"曜日 " +
					GUILD_JOIN_DATE.getHours().toString() +
					"時 " +
					GUILD_JOIN_DATE.getMinutes().toString() +
					"分 " +
					GUILD_JOIN_DATE.getSeconds().toString() +
					"秒 " +
					GUILD_JOIN_DATE.getMilliseconds().toString() +
					"ミリ秒\n" +
					//アメリカ表記
					Math.floor((NOW_DATE - GUILD_JOIN_DATE) / (1000 * 60 * 60 * 24)).toString() +
					"日前",
				inline: false
			});
		}

		//BOTか
		if (USER.bot) {
			EB.addFields({
				name: "BOTか",
				value: "はい",
				inline: false
			});
		} else {
			EB.addFields({
				name: "BOTか",
				value: "いいえ",
				inline: false
			});
		}

		//キック可能か
		if (MEMBER.kickable) {
			EB.addFields({
				name: "わたしはこのユーザーを",
				value: "追放できます",
				inline: false
			});
		} else {
			EB.addFields({
				name: "わたしはこのユーザーを",
				value: "追放できません",
				inline: false
			});
		}

		//BAN可能か
		if (MEMBER.bannable) {
			EB.addFields({
				name: "わたしはこのユーザーを",
				value: "BANできます",
				inline: false
			});
		} else {
			EB.addFields({
				name: "わたしはこのユーザーを",
				value: "BANできません",
				inline: false
			});
		}

		await E.editReply({ embeds: [EB] });
	}

	async MINECRAFT() {
		let E = this.E;
		try {
			const MCID = E.options.getString("mcid");

			const RES_GET_UUID = await fetch("https://api.mojang.com/users/profiles/minecraft/" + MCID, {
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			});

			if (RES_GET_UUID.ok) {
				const RESULT_GET_UUID = await RES_GET_UUID.json();

				const RES_GET_BASE64 = await fetch("https://sessionserver.mojang.com/session/minecraft/profile/" + RESULT_GET_UUID.id, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (RES_GET_BASE64.ok) {
					const RESULT_GET_BASE64 = await RES_GET_BASE64.json();

					const RESULT_JSON = JSON.parse(atob(RESULT_GET_BASE64.properties[0].value));

					//埋め込み
					const EB = new MessageEmbed();

					//ユーザー名とスキン
					EB.setTitle("マイクラユーザーの情報");
					EB.setDescription(RESULT_GET_BASE64.name);
					EB.setColor(RND_COLOR());
					EB.setThumbnail(RESULT_JSON.textures.SKIN.url);

					//UUID
					EB.addFields({
						name: "UUID",
						value: RESULT_GET_BASE64.id,
						inline: false
					});

					//プロフィールID
					EB.addFields({
						name: "PFID",
						value: RESULT_JSON.profileId,
						inline: false
					});

					//結果を出力
					await E.editReply({ embeds: [EB] });
				} else {
					await E.editReply("MojangAPIに拒否られた｡ﾟ･（>Д<）･ﾟ｡");
				}
			} else {
				//エラーを返されたので
				switch (RES_GET_UUID.status) {
					case 404:
						await E.editReply("そんなユーザー居ないらしいよ");
						return;

					default:
						await E.editReply("MojangAPIに拒否られた｡ﾟ･（>Д<）･ﾟ｡");
						return;
				}
			}
		} catch (EX) {
			console.error("[ ERR ][ MINE ]" + EX);
			await E.editReply("エラー");
		}
	}
}
