package cube.cloud.db.dao.impl;

import java.io.File;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import cube.cloud.core.FileType;
import cube.cloud.core.SharedFile;
import cube.cloud.db.dao.BaseDao;
import cube.cloud.db.dao.SharedFileDao;

public class SharedFileDaoImpl extends BaseDao implements SharedFileDao {

	public SharedFileDaoImpl() {
		super();
	}

	@Override
	public List<SharedFile> findSharedFileByTenantId(long tenantId) {
		final String sql = "select * from file as f  where f.tenant_id = ?";
		
		List<SharedFile> list = new ArrayList<SharedFile>();
		
		Connection conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			conn = getConnection();
			
			ps = conn.prepareStatement(sql);
			ps.setLong(1, tenantId);
			
			rs = ps.executeQuery();
			
			while (rs.next()) {
				int fileId = rs.getInt("file_id");
				String fileRealName = rs.getString("file_real_name");
				String filePath = rs.getString("file_path");
				String fileType = rs.getString("file_type");
				
				SharedFile sharedFile = new SharedFile(fileId, new File(filePath), fileRealName, FileType.parseType(fileType));
				list.add(sharedFile);
			}
			
			rs.close();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			this.closeConnection(conn);
		}
		return list;
	}
	
	@Override
	public List<SharedFile> findSharedFile(long tenantId, SharedFile file) {
		final String sql = "select * from file as f  where f.tenant_id = ? and f.file_real_name = ?";
		
		List<SharedFile> list = new ArrayList<SharedFile>();
		
		Connection conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			conn = getConnection();
			
			ps = conn.prepareStatement(sql);
			ps.setLong(1, tenantId);
			ps.setString(2, file.getFileRealName());
			
			rs = ps.executeQuery();
			
			while (rs.next()) {
				int fileId = rs.getInt("file_id");
				String fileRealName = rs.getString("file_real_name");
				String filePath = rs.getString("file_path");
				String fileType = rs.getString("file_type");
				
				SharedFile sharedFile = new SharedFile(fileId, new File(filePath), fileRealName, FileType.parseType(fileType));
				list.add(sharedFile);
			}
			
			rs.close();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			this.closeConnection(conn);
		}
		return list;
	}

	@Override
	public void addSharedFile(SharedFile sharedFile, long tenantId) {
		final String file_sql = "insert into file (tenant_id, file_name, file_real_name, file_path, file_type ) values (?, ?, ?, ?, ?)";
		
		Connection conn = null;
		PreparedStatement ps = null;
		try {
			conn = getConnection();
			
			// 禁止自动提交
			conn.setAutoCommit(false);
			
			ps = conn.prepareStatement(file_sql, Statement.RETURN_GENERATED_KEYS);
			ps.setLong(1, tenantId);
			ps.setString(2, sharedFile.getFile().getName());
			ps.setString(3, sharedFile.getFileRealName());
			ps.setString(4, sharedFile.getFile().getPath());
			ps.setString(5, sharedFile.getType().getExtension());
			
			ps.executeUpdate();
			
			ResultSet rs = ps.getGeneratedKeys();
			if(rs.next()){
				long id = rs.getLong(1);
				sharedFile.setFileId(id);
			}
			
			rs.close();
			ps.close();
			
			conn.commit();
		} catch (SQLException e) {
			e.printStackTrace();
			try {
				// 操作不成功，则回滚
				conn.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
		} finally {
			this.closeConnection(conn);
		}
	}

	@Override
	public void addSharedFileSplit(String url, String fileRealName) {
		final String file_sql = "insert into file_split (file_real_name, file_split_path) values (?, ?)";
		
		Connection conn = null;
		PreparedStatement ps = null;
		try {
			conn = getConnection();
			
			// 禁止自动提交
			conn.setAutoCommit(false);
			
			ps = conn.prepareStatement(file_sql);
			ps.setString(1, fileRealName);
			ps.setString(2, url);
			
			ps.executeUpdate();
			ps.close();
			
			conn.commit();
		} catch (SQLException e) {
			e.printStackTrace();
			try {
				// 操作不成功，则回滚
				conn.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
		} finally {
			this.closeConnection(conn);
		}
	}

	@Override
	public List<String> findSharedFileSplit(String fileRealName) {
		final String sql = "select * from file_split as f  where f.file_real_name = ?";
		
		List<String> list = new ArrayList<String>();
		
		Connection conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			conn = getConnection();
			
			ps = conn.prepareStatement(sql);
			ps.setString(1, fileRealName);
			
			rs = ps.executeQuery();
			
			while (rs.next()) {
				String filePath = rs.getString("file_split_path");
				list.add(filePath);
			}
			
			rs.close();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			this.closeConnection(conn);
		}
		return list;
	}
	
}
