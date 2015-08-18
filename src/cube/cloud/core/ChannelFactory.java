package cube.cloud.core;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Vector;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

import net.cellcloud.common.LogLevel;
import net.cellcloud.common.Logger;
import net.cellcloud.util.Clock;
import cube.cloud.db.dao.MembersDao;
import cube.cloud.db.dao.impl.ChannelDaoImpl;
import cube.cloud.db.dao.impl.MembersDaoImpl;

/**
 * 
 * @author Jiangwei Xu
 *
 */
public class ChannelFactory implements ChannelListener {

	private final static ChannelFactory instance = new ChannelFactory();

	private final static Random RANDOM = new Random(System.currentTimeMillis());
	// 字母表
	private static final char[] ALPHABET = { 'A', 'B', 'C', 'D', 'E', 'F', 'G',
			'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
			'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
			'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
			'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7',
			'8', '9', '0' };

	public final static String AUTHCODE = "cube.channel7a28464563d4200b990652d7f7491c95";

	private ConcurrentHashMap<String, Channel> channels;
	private Vector<Channel> openChannels;
	private ChannelMapCache mapCache;
	private ChannelDaoImpl channelDaoImpl;
	private MembersDao membersDao;

	private AtomicBoolean started;

	private Timer timer;

	private ChannelFactory() {
		this.started = new AtomicBoolean(false);
		this.channels = new ConcurrentHashMap<String, Channel>();
		this.openChannels = new Vector<Channel>();
		this.mapCache = new ChannelMapCache();
		this.channelDaoImpl = new ChannelDaoImpl();
		this.membersDao = new MembersDaoImpl();
	}

	public static ChannelFactory getInstance() {
		return ChannelFactory.instance;
	}

	public synchronized void start() {
		if (this.started.get()) {
			return;
		}

		this.started.set(true);

		Logger.i(this.getClass(), "Start channel factory");

		this.timer = new Timer();
		this.timer.scheduleAtFixedRate(new InnerTask(), 60 * 1000, 60 * 1000);

		this.syncFromDatabase();
	}

	public synchronized void stop() {
		if (!this.started.get()) {
			return;
		}

		this.started.set(false);

		Logger.i(this.getClass(), "Stop channel factory");

		this.timer.cancel();
		this.timer.purge();
		this.timer = null;
	}

	public Channel getChannel(String sessionId) {
		return this.channels.get(sessionId);
	}

	public List<Channel> getChannelsByFounder(Tenant tenant) {
		return this.mapCache.getChannelsByFounder(tenant);
	}

	public List<Channel> getChannelsByMember(Tenant tenant) {
		List<Channel> list = this.mapCache.getChannelsByMember(tenant);
		if (null == list) {
			return null;
		}

		ArrayList<Channel> ret = new ArrayList<Channel>();
		ret.addAll(list);
		return ret;
	}

	public Channel createChannel(String displayName, boolean open,
			int maxTenants, String password, Tenant presenter) {
		// 生成 Session ID
		String sessionId = randomSessionId(32);
		// 创建协作器
		Channel channel = new Channel(sessionId, displayName, open,
				maxTenants, presenter);
		// 通知 Cube 服务器
		boolean ret = DispatcherAgent.getInstance().createGroup(channel);
		if (!ret) {
			Logger.w(this.getClass(), "Create channel failed: " + displayName);
			channel = null;
			return null;
		}

		// 设置监听器
		channel.addListener(this);

		// 映射协作创建者
		this.mapCache.mapFounder(presenter.getName(), channel);
		// 存储
		this.channels.put(sessionId, channel);

		// 缓存开放的协作
		if (open) {
			this.openChannels.insertElementAt(channel, 0);
		}

		// 设置参数
		if (null != password && password.length() > 1) {
			channel.setPassword(password);
		}

		try {
			this.channelDaoImpl.addChannel(channel);
		} catch (Exception e) {
			Logger.log(this.getClass(), e, LogLevel.ERROR);
		}

		// 返回
		return channel;
	}

	public void deleteChannel(Channel channel) {
		this.mapCache.clearChannel(channel);
		this.openChannels.remove(channel);
		this.channels.remove(channel.getSessionId());

		boolean ret = DispatcherAgent.getInstance().deleteGroup(channel);
		if (!ret) {
			Logger.w(this.getClass(), "Can NOT delete group: " + channel.getCubeGroupAccount());
		}

		// 销毁
		channel.destroy();

		// 数据库操作
		this.channelDaoImpl.deleteChannel(channel.getSessionId());
	}

	public List<Channel> getAllOpenChannels() {
		return this.openChannels;
	}

	private void syncFromDatabase() {
		List<Channel> list = this.channelDaoImpl.findAllChannel();
		if (list != null && list.size() > 0) {
			int sum = list.size();

			for (int i = 0; i < sum; i++) {
				this.renewChannel(list.get(i));
			}
		}
	}

	private void renewChannel(Channel channel) {
		// 通知 Cube 服务器
		boolean ret = DispatcherAgent.getInstance().createGroup(channel);
		if (!ret) {
			Logger.w(this.getClass(), "Can NOT create group");
			return;
		}

		// 设置监听器
		channel.addListener(this);

		// 映射协作创建者
		this.mapCache.mapFounder(channel.getFounderName(), channel);
		// 存储
		this.channels.put(channel.getSessionId(), channel);

		// 缓存开放的协作
		if (channel.isOpen()) {
			this.openChannels.add(channel);
		}
	}

	@Override
	public void onJoin(Channel channel, Tenant tenant) {
		this.mapCache.map(tenant, channel);

		if (!tenant.isGuest()) {
			this.membersDao.add(channel, tenant);
		}

		ArrayList<String> list = new ArrayList<String>();
		list.add(tenant.getCubeAccount());
		if (!DispatcherAgent.getInstance().addMember(channel, list)) {
			Logger.w(this.getClass(), "Can NOT add member to group: " + channel.getCubeGroupAccount());
		}
		list = null;
	}

	@Override
	public void onQuit(Channel channel, Tenant tenant) {
		this.mapCache.unmap(tenant, channel);

		if(!tenant.isGuest()){
			this.membersDao.delete(channel.getId(), tenant.getTenantId());
		}

		ArrayList<String> list = new ArrayList<String>();
		list.add(tenant.getCubeAccount());
		if (!DispatcherAgent.getInstance().removeMember(channel, list)) {
			Logger.w(this.getClass(), "Can NOT remove member to group: " + channel.getCubeGroupAccount());
		}
		list = null;
	}

	@Override
	public void onComeback(Channel channel, Tenant tenant) {
		this.mapCache.map(tenant, channel);

		ArrayList<String> list = new ArrayList<String>();
		list.add(tenant.getCubeAccount());
		if (!DispatcherAgent.getInstance().addMember(channel, list)) {
			Logger.w(this.getClass(), "#onComeback# Can NOT add member to group: " + channel.getCubeGroupAccount());
		}
		list = null;
	}

	@Override
	public void onLeave(Channel channel, Tenant tenant) {
		this.mapCache.unmap(tenant, channel);

		ArrayList<String> list = new ArrayList<String>();
		list.add(tenant.getCubeAccount());
		if (!DispatcherAgent.getInstance().removeMember(channel, list)) {
			Logger.w(this.getClass(), "#onLeave# Can NOT remove member to group: " + channel.getCubeGroupAccount());
		}
		list = null;
	}

	protected class InnerTask extends TimerTask {
		protected InnerTask() {
		}

		@Override
		public void run() {
			Logger.d(this.getClass(), "Channel factory maintaining");

			long time = Clock.currentTimeMillis();
			ArrayList<Channel> list = new ArrayList<Channel>();

			for (Map.Entry<String, Channel> entry : channels.entrySet()) {
				Channel c = entry.getValue();
				long expiry = c.getExpiry() * 60l * 60l * 1000l;
				if (time - c.getCreateDate().getTime() > expiry) {
					list.add(c);
				}
			}

			if (!list.isEmpty()) {
				for (Channel channel : list) {
					deleteChannel(channel);
				}
				list.clear();
			}
			list = null;
		}
	}

	/**
	 * 生成随机字符串。
	 */
	private static String randomSessionId(int length) {
		char[] buf = new char[length];
		int max = ALPHABET.length - 1;
		int min = 0;
		int index = 0;
		for (int i = 0; i < length; ++i) {
			index = RANDOM.nextInt(max) % (max - min + 1) + min;
			buf[i] = ALPHABET[index];
		}
		return new String(buf);
	}
}
