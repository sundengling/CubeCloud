package cube.cloud.db.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import cube.cloud.core.Channel;
import cube.cloud.core.Tenant;
import cube.cloud.db.dao.BaseDao;
import cube.cloud.db.dao.MembersDao;
import cube.cloud.db.dao.TenantDao;

public class MembersDaoImpl extends BaseDao implements MembersDao {

	@Override
	public void add(Channel channel, Tenant tenant) {
		final String sql = "insert into members (channel_id, channel_name, tenant_id, tenant_name) values (?, ?, ?, ?)";
		
		Connection connection = null;
		PreparedStatement ps = null;
		try {
			connection = getConnection();
			
			//禁止自动提交
			connection.setAutoCommit(false);

			ps = connection.prepareStatement(sql);
			ps.setLong(1, channel.getId());
			ps.setString(2, channel.getDisplayName());
			ps.setLong(3, tenant.getTenantId());
			ps.setString(4, tenant.getName());

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
	public void update(Channel channel, Tenant tenant) {
		
	}

	@Override
	public void delete(long channelId, long tenantId) {
		final String sql = "delete from members where members.channel_id = ? and members.tenant_id = ?";
		
		Connection connection = null;
		PreparedStatement ps = null;
		try {
			connection = getConnection();
			
			//禁止自动提交
			connection.setAutoCommit(false);
			
			ps = connection.prepareStatement(sql);
			ps.setLong(1, channelId);
			ps.setLong(2, tenantId);

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
	public Tenant findOne(long channelId, long tenantId) {
		final String sql = "select * from members as m where m.channel_id = ? and m.tenant_id = ?";
		
		Tenant tenant = null;
		
		Connection conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			conn = getConnection();
			ps = conn.prepareStatement(sql);
			ps.setLong(1, channelId);
			ps.setLong(2, tenantId);

			rs = ps.executeQuery();
			
			while (rs.next()) {
				TenantDao tenantDao = new TenantDaoImpl();
				tenant = tenantDao.getTenantById(tenantId);
			}
			
			rs.close();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			this.closeConnection(conn);
		}
		return tenant;
	}

	@Override
	public List<Tenant> findAll() {
		// TODO Auto-generated method stub
		return null;
	}
}
