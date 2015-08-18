package cube.cloud.core;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

import net.cellcloud.common.Logger;
import net.cellcloud.util.Clock;

public final class TenantCache extends TimerTask {

	private final static TenantCache instance = new TenantCache();

	private Object mutex;
	private ConcurrentHashMap<String, Tenant> tenantNameMap;
	private ConcurrentHashMap<String, Tenant> tenantTokenMap;
	private ConcurrentHashMap<String, Tenant> tenantCubeMap;

	private Timer timer;
	// 默认 10 分钟
	private final long timeout = 10l * 60l * 1000l;

	private TenantCache() {
		this.mutex = new Object();
		this.tenantNameMap = new ConcurrentHashMap<String, Tenant>();
		this.tenantTokenMap = new ConcurrentHashMap<String, Tenant>();
		this.tenantCubeMap = new ConcurrentHashMap<String, Tenant>();

		this.timer = new Timer();
		this.timer.scheduleAtFixedRate(this, 60 * 1000, 5 * 60 * 1000);
	}

	public final static TenantCache getInstance() {
		return TenantCache.instance;
	}

	public void put(Tenant tenant) {
		synchronized (this.mutex) {
			if (this.tenantNameMap.containsKey(tenant.getName())) {
				Tenant old = this.tenantNameMap.remove(tenant.getName());
				this.tenantTokenMap.remove(old.getToken());
			}

			this.tenantNameMap.put(tenant.getName(), tenant);
			this.tenantTokenMap.put(tenant.getToken(), tenant);
			this.tenantCubeMap.put(tenant.getCubeAccount(), tenant);
		}
	}

	public boolean exists(String name) {
		synchronized (this.mutex) {
			return this.tenantNameMap.containsKey(name);
		}
	}

	public Tenant getByName(String name) {
		synchronized (this.mutex) {
			return this.tenantNameMap.get(name);
		}
	}

	public Tenant getByToken(String token) {
		synchronized (this.mutex) {
			return this.tenantTokenMap.get(token);
		}
	}

	public Tenant getByCubeAccount(String cubeAccount) {
		synchronized (this.mutex) {
			return this.tenantCubeMap.get(cubeAccount);
		}
	}

	public List<Tenant> getOnlineList() {
		ArrayList<Tenant> ret = new ArrayList<Tenant>();
		synchronized (this.mutex) {
			for (Tenant t : this.tenantTokenMap.values()) {
				ret.add(t);
			}
		}
		return ret;
	}

	/**
	 * 租户注销，即租户被置为离线状态。
	 * @param tenant
	 */
	public void dispose(Tenant tenant) {
		synchronized (this.mutex) {
			this.tenantNameMap.remove(tenant.getName());
			this.tenantTokenMap.remove(tenant.getToken());
			this.tenantCubeMap.remove(tenant.getCubeAccount());
		}

		tenant.destroy();
	}

	public void reset(Tenant tenant) {
		synchronized (this.mutex) {
			String old = tenant.getToken();
			if (null != old) {
				this.tenantTokenMap.remove(old);
			}
			old = tenant.getCubeAccount();
			if (null != old) {
				this.tenantCubeMap.remove(old);
			}

			String newCubeAccount = tenant.resetCubeAccount();
			String newToken = tenant.resetToken();

			this.tenantTokenMap.put(newToken, tenant);
			this.tenantCubeMap.put(newCubeAccount, tenant);
			this.tenantNameMap.put(tenant.getName(), tenant);

			// 更新时间戳
			tenant.timestamp = Clock.currentTimeMillis();
		}
	}

	@Override
	public void run() {
		Logger.d(this.getClass(), "Tenant cache maintaining");

		ArrayList<Tenant> tenantList = new ArrayList<Tenant>(2);

		long time = Clock.currentTimeMillis();
		synchronized (this.mutex) {
			for (Tenant tenant : this.tenantNameMap.values()) {
				if (time - tenant.timestamp > this.timeout) {
					tenantList.add(tenant);
				}
			}
		}

		if (!tenantList.isEmpty()) {
			for (Tenant tenant : tenantList) {
				// 找到租户所在的协作频道
				List<Channel> list = ChannelFactory.getInstance().getChannelsByMember(tenant);
				if (null != list) {
					for (Channel c : list) {
						// 将租户置为离开
						c.leave(tenant);
					}
				}

				// 处理离线租户
				this.dispose(tenant);
			}
			tenantList.clear();
		}
		tenantList = null;
	}
}
