package cube.cloud.rest.channel;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import cube.cloud.StateCode;
import cube.cloud.core.Channel;
import cube.cloud.core.ChannelFactory;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class TenantList
 */
@WebServlet("/channel/list/tenant")
public class TenantList extends HttpServlet {
	private static final long serialVersionUID = 1463487293311570189L;

	public TenantList() {
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		cube.cloud.core.Tenant tenant = ServletUtils.verifyWithCookie(request, response);
		if (null == tenant) {
			return;
		}

		String csid = request.getParameter("csid");
		Channel channel = ChannelFactory.getInstance().getChannel(csid);
		if (null == channel) {
			ServletUtils.respond(response, StateCode.InternalServerError);
			return;
		}

		// TODO
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
	}
}
