package cube.cloud.auth;

/**
 * 权限
 */
public enum Authority {

	//读白板
	ReadWhileboard(100, 110),

	//写白板
	WriteWhileboard(110, 120),

	//分享文件
	SharingFile(120, 150),

	VoiceIn(-1, 210),

	VoiceOut(-1, 220),

	VideoIn(-1, 230),

	VideoOut(-1, 240),

	//发消息
	SendMessage(-1, 310),

	//收消息
	ReceiveMessage(-1, 320),

	//举手
	HandsUp(-1, 700),

	//邀请
	Invite(-1, 800),

	//踢人
	KickOut(-1, 940),

	None(-1, -1);

	private int prefix;
	private int code;

	Authority(int prefix, int code) {
		this.prefix = prefix;
		this.code = code;
	}

	public int getPrefix() {
		return this.prefix;
	}
	public int getCode() {
		return this.code;
	}

	public static Authority parse(int code) {
		switch (code) {
		case 110:
			return Authority.ReadWhileboard;
		case 120:
			return Authority.WriteWhileboard;
		case 150:
			return Authority.SharingFile;
		case 210:
			return Authority.VoiceIn;
		case 220:
			return Authority.VoiceOut;
		case 230:
			return Authority.VideoIn;
		case 240:
			return Authority.VideoOut;
		case 310:
			return Authority.SendMessage;
		case 320:
			return Authority.ReceiveMessage;
		case 700:
			return Authority.HandsUp;
		case 800:
			return Authority.Invite;
		case 940:
			return Authority.KickOut;
		default:
			return Authority.None;
		}
	}
}
