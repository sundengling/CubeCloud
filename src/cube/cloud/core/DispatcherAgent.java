package cube.cloud.core;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;

import net.cellcloud.common.LogLevel;
import net.cellcloud.common.Logger;
import net.cellcloud.talk.Primitive;
import net.cellcloud.talk.TalkListener;
import net.cellcloud.talk.TalkService;
import net.cellcloud.talk.TalkServiceFailure;
import net.cellcloud.talk.dialect.ActionDialect;
import net.cellcloud.talk.dialect.Dialect;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class DispatcherAgent implements TalkListener {

	protected static final String ACTION_CREATE_GROUP = "create-group";
	protected static final String ACTION_CREATE_GROUP_ACK = "create-group-ack";
	protected static final String ACTION_DELETE_GROUP = "delete-group";
	protected static final String ACTION_DELETE_GROUP_ACK = "delete-group-ack";

	protected static final String ACTION_ADD_MEMBER = "add-member";
	protected static final String ACTION_ADD_MEMBER_ACK = "add-member-ack";
	protected static final String ACTION_REMOVE_MEMBER = "remove-member";
	protected static final String ACTION_REMOVE_MEMBER_ACK = "remove-member-ack";

	private final static DispatcherAgent instance = new DispatcherAgent();

	private String host;
	private int port;
	private String identifier;
	private String token;

	private DispatcherAgent() {
	}

	public static DispatcherAgent getInstance() {
		return DispatcherAgent.instance;
	}

	public void start(String host, int port, String identifier, String token) {
		this.host = host.toString();
		this.port = port;
		this.identifier = identifier.toString();
		this.token = token.toString();

		TalkService.getInstance().addListener(this);

		List<String> identifiers = new ArrayList<String>();
		identifiers.add(this.identifier);
		InetSocketAddress address = new InetSocketAddress(this.host, this.port);
		TalkService.getInstance().call(identifiers, address);
	}

	public void stop() {
		TalkService.getInstance().removeListener(this);
	}

	public boolean createGroup(Channel channel) {
		if (!TalkService.getInstance().isCalled(this.identifier)) {
			return false;
		}

		String groupName = channel.getCubeGroupAccount();
		String memberName = null;
		Tenant founder = channel.getFounder();
		if (null != founder) {
			memberName = founder.getCubeAccount();
		}

		JSONObject json = new JSONObject();
		try {
			json.put("name", groupName);

			if (null != memberName) {
				JSONArray members = new JSONArray();
				members.put(memberName);
				json.put("members", members);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}

		ActionDialect dialect = new ActionDialect();
		dialect.setAction(ACTION_CREATE_GROUP);
		dialect.appendParam("token", this.token);
		dialect.appendParam("group", json);
		return TalkService.getInstance().talk(this.identifier, dialect);
	}

	public boolean deleteGroup(Channel channel) {
		if (!TalkService.getInstance().isCalled(this.identifier)) {
			return false;
		}

		String groupName = channel.getCubeGroupAccount();

		JSONObject json = new JSONObject();
		try {
			json.put("name", groupName);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		ActionDialect dialect = new ActionDialect();
		dialect.setAction(ACTION_DELETE_GROUP);
		dialect.appendParam("token", this.token);
		dialect.appendParam("group", json);
		return TalkService.getInstance().talk(this.identifier, dialect);
	}

	public boolean addMember(Channel channel, List<String> newMemberList) {
		if (!TalkService.getInstance().isCalled(this.identifier)) {
			return false;
		}

		String groupName = channel.getCubeGroupAccount();

		JSONObject json = new JSONObject();
		try {
			json.put("name", groupName);

			JSONArray members = new JSONArray();
			for (String name : newMemberList) {
				members.put(name);
			}

			json.put("members", members);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		ActionDialect dialect = new ActionDialect();
		dialect.setAction(ACTION_ADD_MEMBER);
		dialect.appendParam("token", this.token);
		dialect.appendParam("group", json);
		return TalkService.getInstance().talk(this.identifier, dialect);
	}

	public boolean removeMember(Channel channel, List<String> memberList) {
		if (!TalkService.getInstance().isCalled(this.identifier)) {
			return false;
		}

		String groupName = channel.getCubeGroupAccount();

		JSONObject json = new JSONObject();
		try {
			json.put("name", groupName);

			JSONArray members = new JSONArray();
			for (String name : memberList) {
				members.put(name);
			}

			json.put("members", members);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		ActionDialect dialect = new ActionDialect();
		dialect.setAction(ACTION_REMOVE_MEMBER);
		dialect.appendParam("token", this.token);
		dialect.appendParam("group", json);
		return TalkService.getInstance().talk(this.identifier, dialect);
	}

	@Override
	public void dialogue(String identifier, Primitive primitive) {
		if (primitive.isDialectal()) {
			Dialect d = primitive.getDialect();
			if (d instanceof ActionDialect) {
				// 排除其他 Cellet
				if (!identifier.equals(this.identifier)) {
					return;
				}

				ActionDialect ad = (ActionDialect) d;
				String action = ad.getAction();
				try {
					JSONObject state = ad.getParamAsJSON("state");
					Logger.i(this.getClass(), "Action: " + action + " - state: " + state.getInt("code"));
				} catch (JSONException e) {
					Logger.log(this.getClass(), e, LogLevel.WARNING);
				}
			}
		}
	}

	@Override
	public void failed(String tag, TalkServiceFailure failure) {
		Logger.d(this.getClass(), "failed: " + tag);

		if (failure.getSourceCelletIdentifierList().contains(this.identifier)) {
			Thread thread = new Thread() {
				@Override
				public void run() {
					List<String> identifiers = new ArrayList<String>();
					identifiers.add(identifier);

					TalkService.getInstance().hangUp(identifiers);

					try {
						Thread.sleep(30000);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}

					InetSocketAddress address = new InetSocketAddress(host, port);
					if (TalkService.getInstance().call(identifiers, address)) {
						Logger.i(DispatcherAgent.class, "Retry call cellet: " + identifier);
					}
					else {
						Logger.i(DispatcherAgent.class, "Retry call cellet failed");
					}
				}
			};
			thread.start();
		}
	}

	@Override
	public void contacted(String identifier, String tag) {
		Logger.d(this.getClass(), "contacted: " + identifier);

		(new Thread() {
			@Override
			public void run() {
				try {
					Thread.sleep(1000);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}

				// 启动 ChannelFactory
				ChannelFactory.getInstance().start();
			}
		}).start();
	}

	@Override
	public void quitted(String identifier, String tag) {
		Logger.d(this.getClass(), "quitted: " + identifier);
	}

	@Override
	public void resumed(String tag, long timestamp, Primitive primitive) {
		// Nothing
	}

	@Override
	public void suspended(String tag, long timestamp, int mode) {
		// Nothing
	}
}
