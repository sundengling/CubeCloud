package cube.cloud.rest.share;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import cube.cloud.StateCode;
import cube.cloud.core.FileManager;
import cube.cloud.core.Tenant;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class UploadFile
 */
@WebServlet("/share/uploadfile")
public class UploadFile extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public UploadFile() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// 校验用户是否合法
		Tenant tenant = ServletUtils.verifyWithParameterNoRespond(request,
				response);
		if (null == tenant) {
			response.sendRedirect(request.getContextPath()
					+ "/upload.jsp?error=" + StateCode.Unauthorized);
			return;
		}

		FileManager.getInstance().receive(tenant, request);
	}
}
