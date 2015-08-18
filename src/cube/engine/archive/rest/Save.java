package cube.engine.archive.rest;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import cube.engine.archive.ArchiveManager;
import cube.engine.archive.Helper;

/**
 * 保存影像。
 */
@WebServlet("/archive/save")
public class Save extends HttpServlet {
	private static final long serialVersionUID = -2117530052753013321L;

	public Save() {
		super();
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// 归档处理
		JSONObject ret = ArchiveManager.getInstance().archive(request);

		// 允许跨域
		response.setHeader("Access-Control-Allow-Origin", "*");
		Helper.respondWithOk(response, ret);
	}
}
