package cube.cloud.rest.channel;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.StateCode;
import cube.cloud.core.TenantCache;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Tenant
 */
@WebServlet("/channel/tenant")
public class Tenant extends HttpServlet {
	private static final long serialVersionUID = 6009122324308400654L;

	public Tenant() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		cube.cloud.core.Tenant tenant = ServletUtils.verifyWithParameter(request, response);
		if (null == tenant) {
			return;
		}

		// 根据 cube name 查询
		String cubeName = request.getParameter("cn");
		if (null != cubeName) {
			cube.cloud.core.Tenant t = TenantCache.getInstance().getByCubeAccount(cubeName);
			if (null == t) {
				ServletUtils.respond(response, StateCode.NotFindTenant);
				return;
			}

			JSONObject data = new JSONObject();
			try {
				data.put("tenant", t.toJSON());
			} catch (JSONException e) {
				e.printStackTrace();
			}
			ServletUtils.respondWithOk(response, data);
			return;
		}

		// 根据 name 查询
		String name = request.getParameter("name");
		if (null != name) {
			cube.cloud.core.Tenant t = TenantCache.getInstance().getByName(name);
			if (null == t) {
				ServletUtils.respond(response, StateCode.NotFindTenant);
				return;
			}

			JSONObject data = new JSONObject();
			try {
				data.put("tenant", t.toJSON());
			} catch (JSONException e) {
				e.printStackTrace();
			}
			ServletUtils.respondWithOk(response, data);
			return;
		}

		// 返回自己的信息
		ServletUtils.respondWithOk(response, tenant.toJSON());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
	}
}
