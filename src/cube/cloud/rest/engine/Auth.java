package cube.cloud.rest.engine;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.StateCode;
import cube.cloud.core.ChannelFactory;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class Auth
 */
@WebServlet("/engine/auth")
public class Auth extends HttpServlet {
	private static final long serialVersionUID = 2126823643321759462L;

	public Auth() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String code = request.getParameter("code");

		// FIXME 判断应用 AppId 和 AppKey
		if (code.equals(ChannelFactory.AUTHCODE)) {
			JSONObject data = new JSONObject();

			JSONObject server = new JSONObject();
			try {
				server.put("switch_ip", "211.103.217.154");
				server.put("switch_port", 5060);
				server.put("dispatcher_ip", "192.168.0.104");
				server.put("dispatcher_port", 7000);
				server.put("dispatcher_http_port", 7070);
				server.put("stun_ip", "211.103.217.154");
				server.put("stun_port", 3478);
				server.put("turn_ip", "211.103.217.154");
				server.put("turn_port", 3478);
				server.put("turn_user", "cube");
				server.put("turn_credential", "cube887");

				data.put("server", server);
			} catch (JSONException e) {
				e.printStackTrace();
			}

			JSONObject candidate = new JSONObject();
			try {
				JSONObject section1 = new JSONObject();
				section1.put("begin", 100000);
				section1.put("end", 109999);

				JSONArray sections = new JSONArray();
				sections.put(section1);

				candidate.put("sections", sections);

				data.put("candidate", candidate);
			} catch (JSONException e) {
				e.printStackTrace();
			}

			ServletUtils.respondWithOk(response, data);
		}
		else {
			ServletUtils.respond(response, StateCode.InvalidParameter);
		}
	}
}
