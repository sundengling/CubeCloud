package cube.cloud.rest.session;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.core.Tenant;
import cube.cloud.core.TenantCache;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class OnlineList
 */
@WebServlet("/online.cube")
public class OnlineList extends HttpServlet {
	private static final long serialVersionUID = 1559169225607365427L;

	public OnlineList() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Tenant tenant = ServletUtils.verifyWithParameter(request, response);
		if (null == tenant) {
			return;
		}

		// 获取所有在线用户
		List<Tenant> onlineList = TenantCache.getInstance().getOnlineList();

		JSONArray array = new JSONArray();
		for (Tenant t : onlineList) {
			array.put(t.toJSON());
		}

		JSONObject data = new JSONObject();
		try {
			data.put("size", array.length());
			data.put("list", array);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		ServletUtils.respondWithOk(response, data);
	}
}
