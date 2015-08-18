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
 * Servlet implementation class Quit
 */
@WebServlet("/channel/quit")
public class Quit extends HttpServlet {
	private static final long serialVersionUID = -4663274414721324271L;

	public Quit() {
		super();
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

		// 退出
		channel.quit(tenant);
		ServletUtils.respond(response, StateCode.Ok);
	}
}
