package cube.cloud.rest.channel;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import cube.cloud.StateCode;
import cube.cloud.core.ChannelFactory;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Channel
 */
@WebServlet("/channel")
public class Channel extends HttpServlet {
	private static final long serialVersionUID = -8555625694024517197L;

	public Channel() {
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

		String csid = request.getParameter("csid");
		if (null == csid) {
			ServletUtils.respond(response, StateCode.InvalidParameter);
			return;
		}

		cube.cloud.core.Channel channel = ChannelFactory.getInstance().getChannel(csid);
		if (null == channel) {
			ServletUtils.respond(response, StateCode.NotFindChannel);
			return;
		}

		// 返回数据
		ServletUtils.respondWithOk(response, channel.toJSON());
	}
}
