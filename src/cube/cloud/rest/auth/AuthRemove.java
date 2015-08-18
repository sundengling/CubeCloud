package cube.cloud.rest.auth;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.StateCode;
import cube.cloud.auth.AuthManager;
import cube.cloud.auth.Authority;
import cube.cloud.auth.PresenterRole;
import cube.cloud.auth.Role;
import cube.cloud.core.Channel;
import cube.cloud.core.ChannelFactory;
import cube.cloud.core.TenantCache;
import cube.cloud.db.dao.TenantDao;
import cube.cloud.db.dao.impl.TenantDaoImpl;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class AuthRemove
 */
@WebServlet("/auth/remove")
public class AuthRemove extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public AuthRemove() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		cube.cloud.core.Tenant tenant = ServletUtils.verify(request, response);
		if (null == tenant) {
			return;
		}

		// 会议id
		String csid = request.getParameter("csid");

		// 租户
		String name = request.getParameter("tenant");

		// 权限代码
		String strAuth = request.getParameter("code");

		if (null == csid || null == name || null == strAuth) {
			ServletUtils.respond(response, StateCode.InvalidParameter);
			return;
		}

		Channel channel = ChannelFactory.getInstance().getChannel(csid);

		if (null == channel) {
			ServletUtils.respond(response, StateCode.NotFindChannel);
			return;
		}

		Role role = channel.getTenantRole(tenant.getName());
		if (null == role || !(role instanceof PresenterRole)) {
			ServletUtils.respond(response, StateCode.Unauthorized);
			return;
		}

		cube.cloud.core.Tenant target = TenantCache.getInstance().getByName(name);
		if (null == target) {
			if (null == target) {
				TenantDao tenantDao = new TenantDaoImpl();
				target = tenantDao.getTenant(name);

				if (null == target) {
					ServletUtils.respond(response, StateCode.NotFindTenant);
					return;
				}
			}
		}
		
		int authCode = Integer.parseInt(strAuth);
		
		//执行了添加权限方法后响应处理

		boolean isSuccess = AuthManager.getInstance().removeAuth(channel, target, Authority.parse(authCode));
		
		JSONObject json = new JSONObject();
		try {
			json.put("isSuccess", isSuccess);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		ServletUtils.respondWithOk(response, json);
	}
}
