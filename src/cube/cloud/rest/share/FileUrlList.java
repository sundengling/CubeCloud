package cube.cloud.rest.share;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.StateCode;
import cube.cloud.core.FileManager;
import cube.cloud.core.Tenant;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class FileUrlList
 */
@WebServlet("/share/fileurllist")
public class FileUrlList extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public FileUrlList() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// 校验用户是否合法
		Tenant tenant = ServletUtils.verifyWithParameter(request,
				response);
		if (null == tenant) {
			response.sendRedirect(request.getContextPath()
					+ "/upload.jsp?error=" + StateCode.Unauthorized);
			return;
		}
		
		//重置convertstate
		request.getSession().setAttribute("convertstate", "notstart");
		
		String fileName = request.getParameter("fileName");

		List<String> list = FileManager.getInstance().requestFileUrlList(fileName, tenant);

		if (null != list) {
			JSONObject data = new JSONObject();
			try{
				JSONArray ja = new JSONArray(list);
				data.put("urllist", ja);
			}catch (JSONException e){
				e.printStackTrace();
			}
			ServletUtils.respondWithOk(response, data);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
