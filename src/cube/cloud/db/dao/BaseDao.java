package cube.cloud.db.dao;

import java.sql.Connection;

import cube.cloud.db.jdbc.ConnectionFactory;


/**
 * 
 * @author pengzhenjin
 *
 */
public class BaseDao {

	public BaseDao() {
	}

	protected Connection getConnection() {
		return ConnectionFactory.getInstance().getConnection();
	}

	protected void closeConnection(Connection conn) {
		ConnectionFactory.getInstance().closeConnection(conn);
	}
}
