package cube.cloud.db.dao;

import java.util.List;

import cube.cloud.core.Channel;
import cube.cloud.core.Tenant;

public interface ChannelDao {
	
	/**
	 * 创建保存频道
	 * 
	 * @param channel
	 */
	public void addChannel(Channel channel);
	
	/**
	 * 删除一条频道记录
	 * 
	 * @param sessionId
	 */
	public void deleteChannel(String sessionId);
	
	/**
	 * 修改频道
	 * 
	 * @param Tenant
	 * @return boolean
	 */
	public boolean updateChannelFounder(Tenant tenant);

	/**
	 * 修改频道
	 * 
	 * @return List<Tenant>
	 */
	public boolean updateChannel(Channel channel);
	
	/**
	 * 查找一条频道
	 * 
	 * @param sessionId
	 * @return Channel
	 */
	public Channel findOneChannel(String sessionId);
	
	/**
	 * 查询所有开放的频道
	 * 
	 * @return List<Channel>
	 */
	public List<Channel> findAllChannel();

	/**
	 * 根据租户查询所有频道
	 * 
	 * @param tenant
	 * @return List<Tenant>
	 */
	public List<Channel> findAllChannelByTenant(Tenant tenant);
}
