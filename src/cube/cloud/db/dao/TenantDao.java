package cube.cloud.db.dao;

import java.util.List;
import java.util.Map;

import cube.cloud.core.Tenant;


public interface TenantDao {
	/**
	 * 增加一条数据
	 * 
	 * @param tenant
	 */
	public void add(Tenant tenant);

	/**
	 * 修改一条数据
	 * 
	 * @param tenant
	 */
	public void update(Tenant tenant);

	/**
	 * 删除一条数据
	 * 
	 * @param name
	 */
	public void delete(String name);

	/**
	 * 查询一条数据
	 * 
	 * @param name
	 * @return Map<String, Object>
	 */
	public Map<String, Object> findOne(String name);

	/**
	 * 查询一条数据
	 * 
	 * @param name
	 * @return Tenant
	 */
	public Tenant getTenant(String name);

	/**
	 * 查询所有数据
	 * 
	 * @return List<Map<String, Object>>
	 */
	public List<Map<String, Object>> findAll();
	
	/**
	 * 查询一条数据
	 * 
	 * @param name
	 * @return Tenant
	 */
	public Tenant getTenantById(long tenantId);
	
}
