package cube.cloud.rest.share;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class ConvertProcess
 */
@WebServlet("/share/convertprocess")
public class ConvertProcess extends HttpServlet {
	private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public ConvertProcess() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String state = (String) request.getSession().getAttribute("convertstate");
		String fileName = (String) request.getSession().getAttribute("filename");
		try {
			JSONObject jo = new JSONObject();
			jo.put("convertstate", state);
			jo.put("filename", fileName);
			ServletUtils.respondWithOk(response, jo);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
