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
 * 上传进度
 * 
 * Servlet implementation class FileProcess
 */
@WebServlet("/sharing/uploadprocess")
public class UploadProcess extends HttpServlet {
	private static final long serialVersionUID = -3912266506947542590L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public UploadProcess() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		HttpSession session = request.getSession();
		String bytesRead = session.getAttribute("bytesread").toString();
		String contentLength = session.getAttribute("contentlength").toString();
		int state = Integer.parseInt(session.getAttribute("state").toString());

		try {
			JSONObject json = new JSONObject();
			json.put("bytesread", bytesRead);
			json.put("contentlength", contentLength);
			json.put("state", state);

			if (state == 200) {
				boolean converting = ((Boolean)session.getAttribute("converting")).booleanValue();
				json.put("converting", converting);
				json.put("file", (JSONObject) session.getAttribute("file"));
			}

			ServletUtils.respondWithOk(response, json);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
}
