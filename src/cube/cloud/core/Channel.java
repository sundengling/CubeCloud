package cube.cloud.core;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Vector;
import java.util.concurrent.ConcurrentHashMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.auth.GuestRole;
import cube.cloud.auth.MemberRole;
import cube.cloud.auth.PresenterRole;
import cube.cloud.auth.Role;


public class Channel {

	public final static String ConferenceURL = "http://211.103.217.154:81/interface/";

	private long id;
	// 会话ID
	private String sessionId;
	// 显示名
	private String displayName;
	// 是否开放
	private boolean open;
	// 最大允许参与人数
	private int maxTenants;

	// 主持人
	private String founderName;
	// 成员名单
	private LinkedList<String> memberNameList;

	// 创建时间
	private Date createDate;
	// 有效期，单位：小时
	private int expiry;

	// 密码
	private String password;

	// 监听器列表
	private ArrayList<ChannelListener> listeners;

	// 参与人列表
	private Vector<Tenant> rtTenants;
	// Cube 组帐号
	private String rtCubeGroupAccount;
	// 角色映射
	private ConcurrentHashMap<String, Role> rtRoleMap;

	public Channel(String sessionId, String displayName, boolean open, int maxTenants, Tenant founder) {
		this.id = 0;
		this.sessionId = sessionId;
		this.displayName = displayName;
		this.open = open;
		this.maxTenants = maxTenants;
		this.founderName = founder.getName();
		this.createDate = new Date();
		this.expiry = 48;
		this.memberNameList = new LinkedList<String>();
		// 加入主持人
		this.memberNameList.add(this.founderName);

		this.rtTenants = new Vector<Tenant>();
		this.rtCubeGroupAccount = CubeAccountPool.allocGroup();
		this.rtRoleMap = new ConcurrentHashMap<String, Role>();

		this.listeners = new ArrayList<ChannelListener>(2);
	}

	public Channel(long id, String sessionId, String displayName, boolean open,
			int maxTenants, String founderName, Date createDate, int expiry, String password) {
		this.id = id;
		this.sessionId = sessionId;
		this.displayName = displayName;
		this.open = open;
		this.maxTenants = maxTenants;
		this.founderName = founderName;
		this.createDate = createDate;
		this.expiry = expiry;
		this.password = password;
		this.memberNameList = new LinkedList<String>();
		// 加入主持人
		this.memberNameList.add(this.founderName);

		this.rtTenants = new Vector<Tenant>();
		this.rtCubeGroupAccount = CubeAccountPool.allocGroup();
		this.rtRoleMap = new ConcurrentHashMap<String, Role>();

		this.listeners = new ArrayList<ChannelListener>(2);
	}

	public void destroy() {
		if (null != this.rtCubeGroupAccount) {
			CubeAccountPool.freeGroup(this.rtCubeGroupAccount);
			this.rtCubeGroupAccount = null;
		}

		this.rtTenants.clear();
		this.rtRoleMap.clear();

		this.listeners.clear();
	}

	public String getSessionId() {
		return this.sessionId;
	}

	public String getDisplayName() {
		return this.displayName;
	}

	public boolean isOpen() {
		return this.open;
	}

	public int getMaxTenants() {
		return this.maxTenants;
	}

	public Tenant getFounder() {
		for (Tenant t : this.rtTenants) {
			if (t.getName().equals(this.founderName))
				return t;
		}
		return null;
	}

	public String getFounderName() {
		return this.founderName;
	}

	public void setMemberNameList(List<String> list) {
		synchronized (this.memberNameList) {
			for (String name : list) {
				if (this.memberNameList.contains(name)) {
					continue;
				}

				this.memberNameList.add(name.toString());
			}
		}
	}

	public List<String> getMemberNameList() {
		synchronized (this.memberNameList) {
			ArrayList<String> ret = new ArrayList<String>(this.memberNameList.size());
			ret.addAll(this.memberNameList);
			return ret;
		}
	}

	public boolean existMember(Tenant tenant) {
		synchronized (this.memberNameList) {
			return this.memberNameList.contains(tenant.getName());
		}
	}

	public Date getCreateDate() {
		return this.createDate;
	}

	public int getExpiry() {
		return this.expiry;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPassword() {
		return this.password;
	}

	public boolean hasPassword() {
		return (null != this.password);
	}

	public void setId(long id) {
		this.id = id;
	}
	
	public long getId() {
		return this.id;
	}

	public synchronized Role getTenantRole(String tenantName) {
		synchronized (this.memberNameList) {
			if (!this.memberNameList.contains(tenantName)) {
				return null;
			}
		}

		if (!this.rtRoleMap.containsKey(tenantName)) {
			if (tenantName.equals(this.founderName)) {
				// 是主持人
				this.rtRoleMap.put(tenantName, new PresenterRole());
			}
			else {
				// 不是主持人
				if (Guest.guessGuestName(tenantName)) {
					this.rtRoleMap.put(tenantName, new GuestRole());
				}
				else {
					this.rtRoleMap.put(tenantName, new MemberRole());
				}
			}
		}

		return this.rtRoleMap.get(tenantName);
	}

	public List<Tenant> getOnlineTenants() {
		return this.rtTenants;
	}

	public String getCubeGroupAccount() {
		return this.rtCubeGroupAccount;
	}

	public boolean isOnline(Tenant tenant) {
		return this.rtRoleMap.containsKey(tenant.getName());
	}

	public boolean isOnline(String tenantName) {
		return this.rtRoleMap.containsKey(tenantName);
	}

	public void addListener(ChannelListener listener) {
		synchronized (this.listeners) {
			if (this.listeners.contains(listener)) {
				return;
			}

			this.listeners.add(listener);
		}
	}

	public void removeListener(ChannelListener listener) {
		synchronized (this.listeners) {
			this.listeners.remove(listener);
		}
	}

	/**
	 * 租户加入。
	 * @param tenant
	 */
	public boolean join(Tenant tenant) {
		// 查看成员列表
		synchronized (this.memberNameList) {
			// 检查人数上限
			if (this.memberNameList.size() >= this.maxTenants) {
				// 人数上限
				return false;
			}

			if (this.memberNameList.contains(tenant.getName())) {
				// 已经有此成员
				return false;
			}

			// 加入新成员
			this.memberNameList.add(tenant.getName());
		}

		// 查询实时在线列表
		synchronized (this.rtTenants) {
			boolean ok = true;
			for (Tenant t : this.rtTenants) {
				if (tenant.getName().equals(t.getName())) {
					ok = false;
					break;
				}
			}

			if (ok) {
				// 加入列表
				this.rtTenants.add(tenant);
			}
		}

		if (!this.rtRoleMap.containsKey(tenant.getName())) {
			if (tenant.getName().equals(this.founderName)) {
				// 是主持人
				this.rtRoleMap.put(tenant.getName(), new PresenterRole());
			}
			else {
				// 不是主持人
				if (tenant instanceof Guest) {
					this.rtRoleMap.put(tenant.getName(), new GuestRole());
				}
				else {
					this.rtRoleMap.put(tenant.getName(), new MemberRole());
				}
			}
		}

		synchronized (this.listeners) {
			for (ChannelListener l : this.listeners) {
				l.onJoin(this, tenant);
			}
		}

		return true;
	}

	/**
	 * 租户退出协作。
	 * @param tenant
	 */
	public void quit(Tenant tenant) {
		synchronized (this.rtTenants) {
			if (this.rtTenants.remove(tenant)) {
				this.rtRoleMap.remove(tenant.getName());
			}
		}

		// 如果是主持人则不能退出，只能离开
		if (tenant.getName().equals(this.founderName)) {
			return;
		}

		// 从成员表里删除
		boolean del = false;
		synchronized (this.memberNameList) {
			if (this.memberNameList.remove(tenant.getName())) {
				del = true;
			}
		}

		if (del) {
			synchronized (this.listeners) {
				for (ChannelListener l : this.listeners) {
					l.onQuit(this, tenant);
				}
			}
		}
	}

	/**
	 * 租户回归。
	 * @param tenant
	 */
	public void comeback(Tenant tenant) {
		synchronized (this.memberNameList) {
			// 如果不包含此成员，则直接返回
			if (!this.memberNameList.contains(tenant.getName())) {
				return;
			}
		}

		// 查询实时在线列表
		synchronized (this.rtTenants) {
			boolean ok = true;
			for (Tenant t : this.rtTenants) {
				if (tenant.getName().equals(t.getName())) {
					ok = false;
					break;
				}
			}

			if (ok) {
				// 加入列表
				this.rtTenants.add(tenant);
			}
		}

		if (!this.rtRoleMap.containsKey(tenant.getName())) {
			if (tenant.getName().equals(this.founderName)) {
				// 是主持人
				this.rtRoleMap.put(tenant.getName(), new PresenterRole());
			}
			else {
				// 不是主持人
				if (tenant instanceof Guest) {
					this.rtRoleMap.put(tenant.getName(), new GuestRole());
				}
				else {
					this.rtRoleMap.put(tenant.getName(), new MemberRole());
				}
			}
		}

		synchronized (this.listeners) {
			for (ChannelListener l : this.listeners) {
				l.onComeback(this, tenant);
			}
		}
	}

	/**
	 * 租户暂离。
	 * @param tenant
	 */
	public void leave(Tenant tenant) {
		synchronized (this.memberNameList) {
			// 如果不包含此成员，则直接返回
			if (!this.memberNameList.contains(tenant.getName())) {
				return;
			}
		}

		boolean cb = false;

		synchronized (this.rtTenants) {
			if (this.rtTenants.remove(tenant)) {
				this.rtRoleMap.remove(tenant.getName());

				cb = true;
			}
		}

		if (cb) {
			synchronized (this.listeners) {
				for (ChannelListener l : this.listeners) {
					l.onLeave(this, tenant);
				}
			}
		}
	}

	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		try {
			json.put("csid", this.sessionId);
			json.put("cubeGroup", this.rtCubeGroupAccount);
			json.put("displayName", this.displayName);
			json.put("open", this.open);
			json.put("maxTenants", this.maxTenants);
			json.put("numTenants", this.rtTenants.size());
			json.put("founder", this.founderName);
			json.put("hasPassword", (null != this.password));
			json.put("createDate", this.createDate.getTime());
			json.put("expiry", this.expiry);

			JSONArray members = new JSONArray();
			for (String name : this.memberNameList) {
				members.put(name);
			}
			json.put("members", members);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return json;
	}
}
