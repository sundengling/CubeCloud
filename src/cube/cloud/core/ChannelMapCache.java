package cube.cloud.core;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 用于管理租户和频道对象之间映射关系的缓存。
 */
public class ChannelMapCache {

	private ConcurrentHashMap<String, List<Channel>> founderMap;
	private ConcurrentHashMap<String, List<Channel>> tenantMap;

	protected ChannelMapCache() {
		this.founderMap = new ConcurrentHashMap<String, List<Channel>>();
		this.tenantMap = new ConcurrentHashMap<String, List<Channel>>();
	}

	public List<Channel> getChannelsByFounder(Tenant founder) {
		synchronized (this.founderMap) {
			return this.founderMap.get(founder.getName());
		}
	}

	public List<Channel> getChannelsByMember(Tenant tenant) {
		synchronized (this.tenantMap) {
			return this.tenantMap.get(tenant.getName());
		}
	}

	protected void clearChannel(Channel channel) {
		synchronized (this.founderMap) {
			Iterator<Map.Entry<String, List<Channel>>> iter = this.founderMap.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, List<Channel>> e = iter.next();
				if (e.getValue().remove(channel)) {
					if (e.getValue().isEmpty()) {
						iter.remove();
					}
				}
			}
		}

		synchronized (this.tenantMap) {
			Iterator<Map.Entry<String, List<Channel>>> iter = this.tenantMap.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, List<Channel>> e = iter.next();
				if (e.getValue().remove(channel)) {
					if (e.getValue().isEmpty()) {
						iter.remove();
					}
				}
			}
		}
	}

	protected void mapFounder(String tenantName, Channel channel) {
		synchronized (this.founderMap) {
			List<Channel> list = this.founderMap.get(tenantName);
			if (null == list) {
				list = new LinkedList<Channel>();
				this.founderMap.put(tenantName, list);
			}

			if (!list.contains(channel)) {
				list.add(channel);
			}
		}
	}

	protected void map(Tenant tenant, Channel channel) {
		synchronized (this.tenantMap) {
			List<Channel> list = this.tenantMap.get(tenant.getName());
			if (null == list) {
				list = new LinkedList<Channel>();
				this.tenantMap.put(tenant.getName(), list);
			}

			if (!list.contains(channel)) {
				list.add(channel);
			}
		}
	}

	protected void unmap(Tenant tenant, Channel channel) {
		synchronized (this.tenantMap) {
			List<Channel> list = this.tenantMap.get(tenant.getName());
			if (null == list) {
				return;
			}

			list.remove(channel);

			if (list.isEmpty()) {
				this.tenantMap.remove(tenant.getName());
			}
		}
	}

	protected void clear() {
		this.founderMap.clear();
		this.tenantMap.clear();
	}
}
