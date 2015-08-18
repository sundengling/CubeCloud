package cube.cloud.auth;

import cube.cloud.core.Channel;
import cube.cloud.core.Tenant;

public interface AuthListener {

	public void onAuthAdded(Channel channel, Tenant tenant, Role role, Authority authority);

	public void onAuthRemoved(Channel channel, Tenant tenant, Role role, Authority authority);
}
