package cube.cloud.rest.auth;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import net.cellcloud.common.Logger;
import cube.cloud.StateCode;
import cube.cloud.core.Tenant;
import cube.cloud.core.TenantCache;
import cube.cloud.db.dao.TenantDao;
import cube.cloud.db.dao.impl.TenantDaoImpl;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Signin
 */
@WebServlet("/auth/signin")
public class Signin extends HttpServlet {
	private static final long serialVersionUID = -6041233334605261074L;

	public Signin() {
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
		boolean page = (null != request.getParameter("direct")) ? false : true;
		String name = request.getParameter("name");
		String pwd = request.getParameter("pwd");

		if (null == name || null == pwd) {
			if (page) {
				response.sendRedirect(request.getContextPath() + "/signin.html?error=" + StateCode.InvalidParameter.getCode());
			}
			else {
				ServletUtils.respond(response, StateCode.InvalidParameter);
			}
			return;
		}

		int expiry = 24 * 60 * 60;
		String remember = request.getParameter("remember");
		if (remember != null) {
			expiry = 7 * expiry;
		}

		// 获取租户
		Tenant tenant = TenantCache.getInstance().getByName(name);
		if (null == tenant) {
			TenantDao tenantDao = new TenantDaoImpl();
			tenant = tenantDao.getTenant(name);

			if (null == tenant) {
				if (page) {
					response.sendRedirect(request.getContextPath() + "/signin.html?error=" + StateCode.NotFindTenant.getCode());
				}
				else {
					ServletUtils.respond(response, StateCode.NotFindTenant);
				}
				return;
			}
		}

		if (!tenant.getPassword().equals(pwd)) {
			if (page) {
				response.sendRedirect(request.getContextPath() + "/signin.html?error=" + StateCode.TenantPasswordNoMatch.getCode());
			}
			else {
				ServletUtils.respond(response, StateCode.TenantPasswordNoMatch);
			}
			return;
		}

		// 重置租户信息
		TenantCache.getInstance().reset(tenant);

		Logger.i(this.getClass(), "Sign in: " + name + "#" + tenant.getToken());

		Cookie cookie = new Cookie("token", tenant.getToken());
		cookie.setMaxAge(expiry);
		response.addCookie(cookie);

		if (page) {
			// 跳转到指定页面
			response.sendRedirect(request.getContextPath() + "/index.html?token=" + tenant.getToken());
		}
		else {
			JSONObject data = new JSONObject();
			try {
				data.put("token", tenant.getToken());
				data.put("tenant", tenant.toJSON());
			} catch (JSONException e) {
				e.printStackTrace();
			}
			ServletUtils.respondWithOk(response, data);
		}
	}
}
