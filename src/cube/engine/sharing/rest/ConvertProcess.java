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
 * Servlet implementation class ConvertProcess
 */
@WebServlet("/sharing/convertprocess")
public class ConvertProcess extends HttpServlet {
	private static final long serialVersionUID = 5292027017677939104L;

	/**
     * @see HttpServlet#HttpServlet()
     */
    public ConvertProcess() {
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
		HttpSession session = request.getSession();
		String convertstate = (String) session.getAttribute("convertstate");
		String name = (String) session.getAttribute("name");
		String filename = (String) session.getAttribute("filename");
		int state = Integer.parseInt(session.getAttribute("state").toString());

		try {
			JSONObject jo = new JSONObject();
			jo.put("convertstate", convertstate);
			jo.put("name", name);
			jo.put("filename", filename);
			jo.put("state", state);
			ServletUtils.respondWithOk(response, jo);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
