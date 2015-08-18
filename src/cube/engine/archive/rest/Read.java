package cube.engine.archive.rest;

import java.io.FileInputStream;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import cube.engine.archive.Archive;
import cube.engine.archive.ArchiveManager;
import cube.engine.archive.Helper;

/**
 * 读取影像数据。
 */
@WebServlet("/archive/read")
public class Read extends HttpServlet {
	private static final long serialVersionUID = -3306672736880800690L;

	public Read() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String name = request.getParameter("name");
		String filename = request.getParameter("file");

		// 允许跨域
		response.setHeader("Access-Control-Allow-Origin", "*");

		Archive archive = ArchiveManager.getInstance().getArchive(name, filename);
		if (null == archive) {
			JSONObject json = new JSONObject();
			try {
				json.put("name", name);
				json.put("file", filename);
			} catch (JSONException e) {
				e.printStackTrace();
			}
			Helper.respondWith(response, HttpServletResponse.SC_NOT_FOUND, json);
			return;
		}

		ServletOutputStream out = response.getOutputStream();
		FileInputStream fis = new FileInputStream(archive.getFile());

		// 将文件读取到输出
		byte[] buf = new byte[10240];
		int len = -1;
		while ((len = fis.read(buf)) > 0) {
			out.write(buf, 0, len);
		}
		fis.close();

		out.flush();
		out.close();
	}
}
