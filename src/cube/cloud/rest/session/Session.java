package cube.cloud.rest.session;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.cellcloud.common.Logger;

/**
 * Servlet implementation class Session
 */
@WebServlet("/session.cube")
public class Session extends HttpServlet {
	private static final long serialVersionUID = 6520768019566001909L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Session() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String uri = "/session.jsp";
		// 如果是本地调试，则使用 Debug 地址
		if (request.getServerName().indexOf("192.168.") >= 0) {
			uri += "?debug=" + request.getServerName();

			Logger.d(this.getClass(), "session.cube -> " + uri);
		}

		RequestDispatcher dispatcher = request.getRequestDispatcher(uri);
		dispatcher.forward(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}
}
