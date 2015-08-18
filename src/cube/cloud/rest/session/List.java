package cube.cloud.rest.session;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.core.Channel;
import cube.cloud.core.ChannelFactory;
import cube.cloud.core.Tenant;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class List
 */
@WebServlet("/list.cube")
public class List extends HttpServlet {
	private static final long serialVersionUID = 4513238614032550534L;

	public List() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Tenant tenant = ServletUtils.verifyWithCookie(request, response);
		if (null == tenant) {
			return;
		}

		java.util.List<Channel> channels = ChannelFactory.getInstance().getAllOpenChannels();
		JSONObject data = new JSONObject();
		try {
			data.put("size", channels.size());

			JSONArray list = new JSONArray();
			for (Channel c : channels) {
				JSONObject channel = c.toJSON();
				list.put(channel);
			}

			data.put("list", list);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		// 响应数据
		ServletUtils.respondWithOk(response, data);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}
}
