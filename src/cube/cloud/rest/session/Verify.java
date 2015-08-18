package cube.cloud.rest.session;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.cellcloud.util.Utils;
import cube.cloud.StateCode;
import cube.cloud.core.Channel;
import cube.cloud.core.ChannelFactory;
import cube.cloud.core.Tenant;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Verify
 */
@WebServlet("/verify.cube")
public class Verify extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Verify() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Tenant tenant = ServletUtils.verifyWithCookieNoRespond(request, response);
		if (null == tenant) {
			response.sendRedirect(request.getContextPath() + "/index.html");
			return;
		}

		String csid = request.getParameter("csid");
		Channel channel = ChannelFactory.getInstance().getChannel(csid);
		if (null == channel) {
			response.sendRedirect(request.getContextPath() + "/index.html");
			return;
		}

		String pwd = channel.getPassword();
		if (null == pwd) {
			response.sendRedirect(request.getContextPath() + "/index.html");
			return;
		}

		String password = request.getParameter("p");
		if (password.equals(pwd)) {
			String v = Utils.randomString(4);
			Cookie cookie = new Cookie("v", v);
			cookie.setMaxAge(24 * 60 * 60);
			response.addCookie(cookie);
			response.sendRedirect(request.getContextPath() + "/session.cube?csid=" + csid + "&v=" + v);
		}
		else {
			RequestDispatcher dispatcher = request.getRequestDispatcher("/verify.jsp?error=" + StateCode.ChannelPasswordNoMatch.getCode());
			dispatcher.forward(request, response);
		}
	}
}
