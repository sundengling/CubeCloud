package cube.cloud.rest.auth;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.cellcloud.common.Logger;

import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.StateCode;
import cube.cloud.core.Tenant;
import cube.cloud.core.TenantCache;
import cube.cloud.db.dao.TenantDao;
import cube.cloud.db.dao.impl.TenantDaoImpl;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Signup
 */
@WebServlet("/auth/signup")
public class Signup extends HttpServlet {
	private static final long serialVersionUID = -9189780085873864548L;

	private TenantDao tenantDao = null;

	public Signup() {
	}

	@Override
	public void init() throws ServletException {
		super.init();
		this.tenantDao = new TenantDaoImpl();
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String name = request.getParameter("name");
		String pwd = request.getParameter("pwd");
		if (null == name || null == pwd) {
			ServletUtils.respond(response, StateCode.InvalidParameter);
			return;
		}

		if (name.length() < 6) {
			ServletUtils.respond(response, StateCode.TenantNameTooShort);
			return;
		}

		if (TenantCache.getInstance().exists(name) || null != tenantDao.getTenant(name)) {
			ServletUtils.respond(response, StateCode.TenantAlreadyExists);
			return;
		}

		// 创建租户
		Tenant tenant = new Tenant(name, pwd);

		// 租户写入缓存
		TenantCache.getInstance().put(tenant);

		// 租户写入数据库
		tenantDao.add(tenant);

		Logger.i(this.getClass(), "Sign up: " + name + "#" + tenant.getToken());

		Cookie cookie = new Cookie("token", tenant.getToken());
		cookie.setMaxAge(7 * 24 * 60 * 60);
		response.addCookie(cookie);

		JSONObject json = new JSONObject();
		try {
			json.put("token", tenant.getToken());
		} catch (JSONException e) {
			e.printStackTrace();
		}
		ServletUtils.respondWithOk(response, json);
	}
}
