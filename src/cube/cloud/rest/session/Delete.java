package cube.cloud.rest.session;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.StateCode;
import cube.cloud.core.Channel;
import cube.cloud.core.ChannelFactory;
import cube.cloud.core.Tenant;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Delete
 */
@WebServlet("/delete.cube")
public class Delete extends HttpServlet {
	private static final long serialVersionUID = -8498967697480233370L;

	public Delete() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
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

		String csid = request.getParameter("csid");
		if (null == csid) {
			ServletUtils.respond(response, StateCode.InvalidParameter);
			return;
		}

		// 返回其创建的所有协作
		java.util.List<Channel> list = ChannelFactory.getInstance().getChannelsByFounder(tenant);
		if (null == list) {
			ServletUtils.respond(response, StateCode.NotFindChannel);
			return;
		}

		Channel channel = null;
		for (Channel c : list) {
			if (c.getSessionId().equals(csid)) {
				channel = c;
				break;
			}
		}

		if (null == channel) {
			ServletUtils.respond(response, StateCode.NotFindChannel);
			return;
		}

		// 删除协作
		ChannelFactory.getInstance().deleteChannel(channel);

		JSONObject data = new JSONObject();
		try {
			data.put("csid", csid);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		ServletUtils.respondWithOk(response, data);
	}
}
