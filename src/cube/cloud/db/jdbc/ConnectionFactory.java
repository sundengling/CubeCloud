package cube.cloud.db.jdbc;

import java.beans.PropertyVetoException;
import java.sql.Connection;
import java.sql.SQLException;

import com.mchange.v2.c3p0.ComboPooledDataSource;

/**
 * 数据库连接
 * 
 * @author pengzhenjin
 *
 */
public class ConnectionFactory {
	private final static ConnectionFactory instance = new ConnectionFactory();

	// 定义数据库的驱动信息
	private final String DRIVER = "com.mysql.jdbc.Driver";

	// 表示定义数据库的用户名
	private String username;

	// 定义数据库的密码
	private String password;

	// 定义访问数据库的地址
	private String url;

	// 定义c3p0连接池
	private ComboPooledDataSource ds = null;

	private ConnectionFactory() {
		
	}

	public final static ConnectionFactory getInstance() {
		return ConnectionFactory.instance;
	}

	public void setConfig(String username, String password, String host) {
		this.username = username;
		this.password = password;
		this.url = "jdbc:mysql://" + host + "/cube_cloud?useUnicode=true&characterEncoding=utf8&autoReconnect=true";

		this.ds = this.createDataSource();
	}

	/**
	 * 获得数据源
	 * 
	 * @return
	 */
	public ComboPooledDataSource createDataSource() {
		ComboPooledDataSource ds = null;
		try {
			ds = new ComboPooledDataSource();

			// 设置JDBC的Driver类
			ds.setDriverClass(DRIVER);

			// 设置JDBC的URL
			ds.setJdbcUrl(this.url);

			// 设置数据库的登录用户名
			ds.setUser(this.username);

			// 设置数据库的登录用户密码
			ds.setPassword(this.password);

			// 设置连接池的最大连接数
			ds.setMaxPoolSize(15);

			// 设置连接池的最小连接数
			ds.setMinPoolSize(3);

			// 设置初始化时获取3个连接，取值应在minPoolSize与maxPoolSize之间
			ds.setInitialPoolSize(3);

			// 设置每30秒检查所有连接池中的空闲连接
			ds.setIdleConnectionTestPeriod(30);

			// 设置最大空闲时间,30秒内未使用则连接被丢弃
			ds.setMaxIdleTime(30);

			// 设置当连接池用完时客户端调用getConnection()后等待获取新连接的时间
			ds.setCheckoutTimeout(30000);

			// 设置数据源内加载的PreparedStatements最大数量
			ds.setMaxStatements(200);
		} catch (PropertyVetoException e) {
			e.printStackTrace();
		}

		return ds;
	}

	/**
	 * 获得数据库的连接
	 * 
	 * @return
	 */
	public synchronized Connection getConnection() {
		Connection conn = null;
		try {
			conn = this.ds.getConnection();
		} catch (SQLException e) {
			e.printStackTrace();
		}

		return conn;
	}

	/**
	 * 关闭数据库连接
	 */
	public void closeConnection(Connection conn) {
		try {
			if (conn != null) {
				conn.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
