package cube.cloud.rest.auth;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.cellcloud.common.Logger;
import cube.cloud.core.Channel;
import cube.cloud.core.ChannelFactory;
import cube.cloud.core.TenantCache;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Signout
 */
@WebServlet("/auth/signout")
public class Signout extends HttpServlet {
	private static final long serialVersionUID = -5582851205137740117L;

	public Signout() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		cube.cloud.core.Tenant tenant = ServletUtils.verifyWithParameter(request, response);
		if (null == tenant) {
			return;
		}

		// 查询租户参与的所有协作
		List<Channel> list = ChannelFactory.getInstance().getChannelsByMember(tenant);
		if (null != list) {
			for (Channel c : list) {
				c.quit(tenant);
			}
		}

		// 处理租户
		TenantCache.getInstance().dispose(tenant);

		Logger.i(this.getClass(), "Sign out: " + tenant.getName());

		Cookie cookie = new Cookie("token", "");
		response.addCookie(cookie);

		ServletUtils.respondWithOk(response, tenant.toJSON());
	}
}
