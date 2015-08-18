package cube.cloud.auth;

public class GuestRole extends Role {

	public GuestRole() {
		super();
		this.addAuthority(Authority.ReadWhileboard);
		this.addAuthority(Authority.VoiceOut);
		this.addAuthority(Authority.Invite);
		this.addAuthority(Authority.ReceiveMessage);
		this.addAuthority(Authority.VideoOut);
	}
}
