package cube.engine.sharing.rest;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;

import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class FileUrlList
 */
@WebServlet("/sharing/fileurllist")
public class FileUrlList extends HttpServlet {
	private static final long serialVersionUID = 320218524686978412L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public FileUrlList() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		HttpSession session = request.getSession();
		
		//重置convertstate
		session.setAttribute("convertstate", "notstart");
		
		try {
			JSONObject json = new JSONObject();
			json.put("file", (JSONObject) session.getAttribute("file"));

			ServletUtils.respondWithOk(response, json);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
