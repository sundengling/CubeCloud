package cube.cloud.db.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import cube.cloud.core.Channel;
import cube.cloud.core.Tenant;
import cube.cloud.db.dao.BaseDao;
import cube.cloud.db.dao.ChannelDao;
import cube.cloud.util.StringUtils;

public class ChannelDaoImpl extends BaseDao implements ChannelDao {

	public ChannelDaoImpl() {
		super();
	}

	@Override
	public void addChannel(Channel channel) {
		Connection conn = getConnection();
		String sql = "insert into channel (session_id,name,is_open,max_tenants,tenant_name,create_date,expiry,password) values (?,?,?,?,?,?,?,?)";
		PreparedStatement ps = null;
		try {
			// 禁止自动提交
			conn.setAutoCommit(false);
			ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
			ps.setString(1, channel.getSessionId());
			ps.setString(2, channel.getDisplayName());
			ps.setInt(3, channel.isOpen() ? 1 : 0);
			ps.setInt(4, channel.getMaxTenants());
			ps.setString(5, channel.getFounderName());
			ps.setString(6,StringUtils.convertDateToString(channel.getCreateDate()));
			ps.setInt(7, channel.getExpiry());
			ps.setString(8, channel.getPassword());
			ps.executeUpdate();
			
			ResultSet rs = ps.getGeneratedKeys();
			if(rs.next()){
				long id = rs.getLong(1);
				channel.setId(id);
			}
			
			rs.close();
			ps.close();
			// 提交事务
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
	public void deleteChannel(String sessionId) {
		final int DELETE_CHANNEL = 1;
		final String sql = "update channel as c set c.is_delete = ? where c.session_id = ?";
		
		Connection conn = null;
		PreparedStatement ps = null;
		try {
			conn = getConnection();
			
			// 禁止自动提交
			conn.setAutoCommit(false);

			ps = conn.prepareStatement(sql);
			ps.setInt(1, DELETE_CHANNEL);
			ps.setString(2, sessionId);
			
			ps.executeUpdate();
			ps.close();
			// 提交事务
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
	public boolean updateChannelFounder(Tenant tenant) {
		return false;
	}

	@Override
	public boolean updateChannel(Channel channel) {
		return false;
	}

	@Override
	public Channel findOneChannel(String sessionId) {
		final String sql = "select * from channel as c where c.session_id = ?";
		
		Channel channel = null;

		Connection conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			conn = getConnection();
			ps = conn.prepareStatement(sql);
			ps.setString(1, sessionId);
			
			rs = ps.executeQuery();
			
			while (rs.next()) {
				long channel_id = rs.getLong("channel_id");
				String session_id = rs.getString("session_id");
				String name = rs.getString("name");
				boolean is_open = rs.getInt("is_open") == 1 ? true : false;
				int max_tenants = rs.getInt("max_tenants");
				Date create_date = StringUtils.parseStringToDate(rs.getString("create_date"));
				int expiry = rs.getInt("expiry");
				String tenantName = rs.getString("tenant_name");
				String password = rs.getString("password");

				channel = new Channel(channel_id, session_id, name, is_open, max_tenants, tenantName, create_date, expiry, password);
			}

			rs.close();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			this.closeConnection(conn);
		}
		return channel;
	}

	@Override
	public List<Channel> findAllChannel() {
		final String sql = "select * from channel as c where timestampdiff(hour,c.create_date,now()) < c.expiry and c.is_delete = 0 order by c.create_date desc limit 500";
		
		List<Channel> list = new ArrayList<Channel>();

		Connection conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			conn = getConnection();
			ps = conn.prepareStatement(sql);
			rs = ps.executeQuery();
			
			while (rs.next()) {
				long channel_id = rs.getLong("channel_id");
				String session_id = rs.getString("session_id");
				String name = rs.getString("name");
				boolean is_open = rs.getInt("is_open") == 1 ? true : false;
				int max_tenants = rs.getInt("max_tenants");
				Date create_date = StringUtils.parseStringToDate(rs.getString("create_date"));
				int expiry = rs.getInt("expiry");
				String tenantName = rs.getString("tenant_name");
				String password = rs.getString("password");
//				boolean delete = rs.getInt("is_delete") == 1 ? true : false;

				Channel channel = new Channel(channel_id, session_id, name, is_open, max_tenants, tenantName, create_date, expiry, password);
				list.add(channel);
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
	public List<Channel> findAllChannelByTenant(Tenant tenant) {
		final String sql = "select * from channel as c left join tenant as t on c.tenant_id = t.tenant_id  where c.is_delete = 0 and t.name = ?  order by create_date desc";
		
		List<Channel> list = new ArrayList<Channel>();
		
		Connection conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			conn = getConnection();
			ps = conn.prepareStatement(sql);
			ps.setString(1, tenant.getName());
			
			rs = ps.executeQuery();
			
			while (rs.next()) {
				long channel_id = rs.getLong("channel_id");
				String session_id = rs.getString("session_id");
				String name = rs.getString("name");
				boolean is_open = rs.getInt("is_open") == 1 ? true : false;
				int max_tenants = rs.getInt("max_tenants");
				Date create_date = StringUtils.parseStringToDate(rs.getString("create_date"));
				int expiry = rs.getInt("expiry");
				String password = rs.getString("password");
				String tenantName = rs.getString("tenant_name");
//				boolean delete = rs.getInt("is_delete") == 1 ? true : false;

				Channel channel = new Channel(channel_id, session_id, name, is_open, max_tenants, tenantName, create_date, expiry, password);
				list.add(channel);
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
