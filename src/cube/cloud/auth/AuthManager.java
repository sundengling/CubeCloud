package cube.cloud.auth;

import java.util.Vector;

import cube.cloud.core.Channel;
import cube.cloud.core.Tenant;


public class AuthManager {
	
	private final static AuthManager instance = new AuthManager();

	private Vector<AuthListener> listeners;

	private AuthManager() {
		
		this.listeners = new Vector<AuthListener>();
		
	}
	
	public void addListener(AuthListener listener) {
		
		//添加监听者
		if (this.listeners.contains(listener)) {
			return;
		}
		this.listeners.add(listener);
	}
	
	public void removeListener(AuthListener listener) {
		
		//移除监听者
		this.listeners.remove(listener);
	}
	
	public static AuthManager getInstance() {
		return AuthManager.instance;
	}

	
	public boolean addAuth(Channel channel, Tenant tenant, Authority auth) {
		Role targetRole = channel.getTenantRole(tenant.getName());
		if (!targetRole.hasAuthority(auth)) {
			targetRole.addAuthority(auth);

			//通知监听者
			for (AuthListener l : this.listeners) {
				l.onAuthAdded(channel, tenant, targetRole, auth);
			}
			
			return true;
		}
		return false;
	}
	
	public boolean removeAuth(Channel channel, Tenant tenant, Authority auth) {
		
		Role targetRole = channel.getTenantRole(tenant.getName());
				
		if (targetRole.hasAuthority(auth)) {
			targetRole.removeAuthority(auth);
						
			//通知监听者
			for (AuthListener l : this.listeners) {
				l.onAuthRemoved(channel, tenant, targetRole, auth);
			}
			
			return true;
		}
		return false;
	}

}