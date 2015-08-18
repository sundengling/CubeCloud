package cube.cloud.db.dao;

import java.util.List;

import cube.cloud.core.SharedFile;

public interface SharedFileDao {
	/**
	 * 增加一条数据
	 * 
	 * @param sharedFile
	 * @param tenantName
	 */
	public void addSharedFile(SharedFile sharedFile, long tenantId);
	
	/**
	 * 查询所有数据
	 * 
	 * @param tenantId
	 * @return List<SharedFile>
	 */
	public List<SharedFile> findSharedFileByTenantId(long tenantId);
	
	/**
	 * 查询所有数据
	 * 
	 * @param tenantId
	 * @param file
	 * @return List<SharedFile>
	 */
	public List<SharedFile> findSharedFile(long tenantId, SharedFile file);

	/**
	 * 增加拆分后的文件
	 * @param url
	 * @param fileId
	 */
	public void addSharedFileSplit(String url, String fileRealName);
	
	/**
	 * 查询拆分后的文件
	 * @param fileRealName
	 * @return
	 */
	public List<String> findSharedFileSplit(String fileRealName);
}
