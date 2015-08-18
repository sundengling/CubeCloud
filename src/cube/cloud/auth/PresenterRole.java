package cube.cloud.auth;

/**
 * 
 */
public class PresenterRole extends MemberRole {

	public PresenterRole(){
		this.addAuthority(Authority.WriteWhileboard);
		this.addAuthority(Authority.SharingFile);
		this.addAuthority(Authority.KickOut);
	}
}
