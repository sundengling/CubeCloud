package cube.cloud.core;

public interface ChannelListener {

	public void onJoin(Channel channel, Tenant tenant);

	public void onQuit(Channel channel, Tenant tenant);

	public void onLeave(Channel channel, Tenant tenant);

	public void onComeback(Channel channel, Tenant tenant);
}
