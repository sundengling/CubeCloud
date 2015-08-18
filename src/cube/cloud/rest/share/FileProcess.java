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
 * Servlet implementation class FileProcess
 */
@WebServlet("/share/fileprocess")
public class FileProcess extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public FileProcess() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String bytesRead = request.getSession().getAttribute("bytesread").toString();
		String contentLength = request.getSession().getAttribute("contentlength").toString();

		try {
			JSONObject jo = new JSONObject();
			jo.put("bytesread", bytesRead);
			jo.put("contentlength", contentLength);
			
			ServletUtils.respondWithOk(response, jo);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
}
