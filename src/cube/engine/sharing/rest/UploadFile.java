package cube.engine.sharing.rest;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import cube.cloud.StateCode;
import cube.engine.sharing.SharingManager;

/**
 * 上传文件
 * 
 * Servlet implementation class UploadFile
 */
@WebServlet("/sharing/uploadfile")
public class UploadFile extends HttpServlet {
	private static final long serialVersionUID = 7286814595445902577L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public UploadFile() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// 帐号
		String name = request.getParameter("name");

		if (null == name || name.isEmpty()) {
			response.sendRedirect(request.getContextPath() + "/fileupload.jsp?error=" + StateCode.Unauthorized);
			return;
		}

		SharingManager.getInstance().receive(name, request);
	}
}
