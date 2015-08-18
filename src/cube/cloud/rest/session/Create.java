package cube.cloud.rest.session;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.cellcloud.common.Logger;
import cube.cloud.StateCode;
import cube.cloud.core.Channel;
import cube.cloud.core.ChannelFactory;
import cube.cloud.core.Tenant;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Create
 */
@WebServlet("/create.cube")
public class Create extends HttpServlet {
	private static final long serialVersionUID = -6531399321608380645L;

	public Create() {
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

		String displayName = request.getParameter("name");
		String strMax = request.getParameter("max");
		int maxTenants = Integer.parseInt(strMax);
		String strOpen = request.getParameter("open");
		boolean open = (strOpen.equals("on") || strOpen.equals("true"));
		String password = request.getParameter("password");

		// 创建协作
		Channel channel = ChannelFactory.getInstance().createChannel(displayName, open, maxTenants, password, tenant);
		if (null == channel) {
			ServletUtils.respond(response, StateCode.InternalServerError);
			return;
		}

		// 返回数据
		ServletUtils.respondWithOk(response, channel.toJSON());

		Logger.i(this.getClass(), "Create channel: " + channel.getDisplayName() + "#" + channel.getSessionId());
	}
}
