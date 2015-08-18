package cube.cloud.rest.auth;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.StateCode;
import cube.cloud.auth.Authority;
import cube.cloud.auth.Role;
import cube.cloud.core.Channel;
import cube.cloud.core.ChannelFactory;
import cube.cloud.core.Tenant;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class AuthQuery
 */
@WebServlet("/auth/query")
public class AuthQuery extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public AuthQuery() {
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

		// 会议id
		String csid = request.getParameter("csid");
		
		if (null == csid) {
			ServletUtils.respond(response, StateCode.InvalidParameter);
			return;
		}
		
		Channel channel = ChannelFactory.getInstance().getChannel(csid);
		
		if (null == channel) {
			ServletUtils.respond(response, StateCode.NotFindChannel);
			return;
		}

		Role role = channel.getTenantRole(tenant.getName());
		List<Authority> authList = role.getAuthorityList();

		if (null == authList || authList.size() <= 0) {
			ServletUtils.respond(response, StateCode.Unauthorized);
			return;
		}

		List<Integer> authCodeList = new ArrayList<Integer>();
		for (Authority auth : authList) {
			authCodeList.add(auth.getCode());
		}

		JSONObject json = new JSONObject();
		try {
			json.put("authCodeList", authCodeList);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		ServletUtils.respondWithOk(response, json);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}
}
