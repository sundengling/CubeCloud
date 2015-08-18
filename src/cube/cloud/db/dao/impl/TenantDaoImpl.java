package cube.cloud.db.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cube.cloud.core.Tenant;
import cube.cloud.db.dao.BaseDao;
import cube.cloud.db.dao.TenantDao;

public class TenantDaoImpl extends BaseDao implements TenantDao {

	@Override
	public void add(Tenant tenant) {
		final String sql = "insert into tenant (name, password, face_url) values (?,?,?)";
		
		Connection connection = null;
		PreparedStatement ps = null;
		try {
			connection = getConnection();
			
			//禁止自动提交
			connection.setAutoCommit(false);
			
			ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
			ps.setString(1, tenant.getName());
			ps.setString(2, tenant.getPassword());
			ps.setString(3, tenant.getFace());

			ps.executeUpdate();
			
			ResultSet rs = ps.getGeneratedKeys();
			if(rs.next()){
				long id = rs.getLong(1);
				tenant.setTenantId(id);
			}
			
			rs.close();
			ps.close();

			// 提交事务
			connection.commit();
		} catch (SQLException e) {
			e.printStackTrace();
			try {
				// 操作不成功，则回滚
				connection.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
		} finally {
			closeConnection(connection);
		}
	}

	@Override
	public void update(Tenant tenant) {
	}

	@Override
	public void delete(String name) {
		final String sql = "delete from tenant where tenant.name = ?";
		
		Connection connection = null;
		PreparedStatement ps = null;
		try {
			connection = getConnection();
			
			// 禁止自动提交
			connection.setAutoCommit(false);

			ps = connection.prepareStatement(sql);
			ps.setString(1, name);

			ps.executeUpdate();
			ps.close();

			// 提交事务
			connection.commit();
		} catch (SQLException e) {
			e.printStackTrace();
			try {
				// 操作不成功，则回滚
				connection.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
		} finally {
			closeConnection(connection);
		}
	}

	@Override
	public Map<String, Object> findOne(String name) {
		final String sql = "select * from tenant t where t.name = ?";
		
		Map<String, Object> dataMap = new HashMap<String, Object>();
		
		Connection connection = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			connection = getConnection();
			ps = connection.prepareStatement(sql);
			ps.setString(1, name);

			// 获得ResultSet结果集
			rs = ps.executeQuery();

			// 获得结果集信息
			ResultSetMetaData rsmd = rs.getMetaData();

			// 获得列的总数
			int colCount = rsmd.getColumnCount();

			// 遍历结果集，根据信息封装成Map
			while (rs.next()) {
				for (int i = 0; i < colCount; i++) {
					String colName = rsmd.getColumnLabel(i + 1);
					dataMap.put(colName, rs.getObject(colName));
				}
			}
			rs.close();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			closeConnection(connection);
		}
		return dataMap;
	}

	@Override
	public Tenant getTenant(String name) {
		Tenant tenant = null;

		TenantDao tenantDao = new TenantDaoImpl();
		Map<String, Object> tenantMap = tenantDao.findOne(name);

		if (tenantMap != null && !tenantMap.isEmpty()) {
			int tenantId = Integer.parseInt(tenantMap.get("tenant_id").toString());
			String tennatName = tenantMap.get("name").toString();
			String password = tenantMap.get("password").toString();
			tenant = new Tenant(tenantId,tennatName, password);
		}

		return tenant;
	}

	@Override
	public List<Map<String, Object>> findAll() {
		final String sql = "select * from tenant";
		
		List<Map<String, Object>> dataList = new ArrayList<Map<String, Object>>();
		Map<String, Object> dataMap = null;
		
		Connection connection = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			connection = getConnection();
			ps = connection.prepareStatement(sql);

			// 获得ResultSet结果集
			rs = ps.executeQuery();

			// 获得结果集信息
			ResultSetMetaData rsmd = rs.getMetaData();

			// 获得列的总数
			int colCount = rsmd.getColumnCount();

			// 遍历结果集，根据信息封装成Map
			while (rs.next()) {
				dataMap = new HashMap<String, Object>();
				for (int i = 0; i < colCount; i++) {
					String colName = rsmd.getColumnLabel(i + 1);
					dataMap.put(colName, rs.getObject(colName));
				}
				dataList.add(dataMap);
			}
			rs.close();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			closeConnection(connection);
		}
		return dataList;
	}

	@Override
	public Tenant getTenantById(long tenantId) {
		final String sql = "select * from tenant t where t.tenant_id = ?";
		
		Connection connection = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		Tenant tenant = null;
		try {
			connection = getConnection();
			ps = connection.prepareStatement(sql);
			ps.setLong(1, tenantId);
			// 获得ResultSet结果集
			rs = ps.executeQuery();
			while (rs.next()) {
				String name = rs.getString("name");
				String password = rs.getString("password");
				tenant = new Tenant(tenantId,name,password);
			}
			rs.close();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			closeConnection(connection);
		}
		return tenant;
	}
}
