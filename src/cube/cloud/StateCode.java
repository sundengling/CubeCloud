package cube.cloud;

public enum StateCode {

	Ok(200),

	InvalidParameter(300),

	IllegalToken(307),
	ExpiredToken(308),
	Unauthorized(310),

	InternalServerError(500),

	NotFindChannel(1000),
	NoOpenChannel(1002),
	ChannelPasswordNoMatch(1003),
	ChannelFull(1004),				// 达到人数上限

	TenantNameTooShort(2001),
	TenantPasswordNoMatch(2003),
	TenantAlreadyExists(2005),
	NotFindTenant(2007),

	Unknown(100);

	private int code;

	StateCode(int code) {
		this.code = code;
	}

	public int getCode() {
		return this.code;
	}

	public static StateCode parse(int code) {
		for (StateCode sc : StateCode.values()) {
			if (sc.code == code) {
				return sc;
			}
		}

		return null;
	}
}
