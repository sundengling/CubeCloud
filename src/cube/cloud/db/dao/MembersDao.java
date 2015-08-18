package cube.cloud.db.dao;

import java.util.List;

import cube.cloud.core.Channel;
import cube.cloud.core.Tenant;


public interface MembersDao {
	/**
	 * 增加一条数据
	 * 
	 * @param channel
	 * @param tenant
	 */
	public void add(Channel channel, Tenant tenant);

	/**
	 * 修改一条数据
	 * 
	 * @param channel
	 * @param tenant
	 */
	public void update(Channel channel, Tenant tenant);

	/**
	 * 删除一条数据
	 * 
	 * @param channelId
	 * @param tenantId
	 */
	public void delete(long channelId, long tenantId);


	/**
	 * 查询一条数据
	 * 
	 *  @param channelId
	 * @param tenantId
	 * @return Tenant
	 */
	public Tenant findOne(long channelId, long tenantId);

	/**
	 * 查询所有数据
	 * 
	 * @return List<Tenant>
	 */
	public List<Tenant> findAll();
	
}
