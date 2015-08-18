package cube.cloud.auth;


/**
 * 
 */
public class MemberRole extends GuestRole {

	public MemberRole() {
		super();
		this.addAuthority(Authority.HandsUp);
		this.addAuthority(Authority.VoiceIn);
		this.addAuthority(Authority.VideoIn);
		this.addAuthority(Authority.SendMessage);
	}
}
