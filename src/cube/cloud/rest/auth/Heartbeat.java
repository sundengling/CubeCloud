package cube.cloud.rest.auth;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import cube.cloud.core.Tenant;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Heartbeat
 */
@WebServlet("/auth/hb")
public class Heartbeat extends HttpServlet {
	private static final long serialVersionUID = -3063762576433828399L;

	public Heartbeat() {
		super();
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		Tenant tenant = ServletUtils.verifyWithParameter(request, response);
		if (null == tenant) {
			return;
		}

		// 更新时间戳
		tenant.refresh();
		ServletUtils.respondWithOk(response, tenant.toJSON());
	}
}
