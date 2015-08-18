package cube.engine.archive.rest;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import cube.engine.archive.Archive;
import cube.engine.archive.ArchiveManager;
import cube.engine.archive.Helper;

/**
 * 归档数据清单。
 */
@WebServlet("/archive/list.js")
public class ListCrossDomain extends HttpServlet {
	private static final long serialVersionUID = 7423835258023443729L;

	public ListCrossDomain() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String account = request.getParameter("name");
		if (null == account) {
			Helper.respondWith(response, HttpServletResponse.SC_UNAUTHORIZED, new JSONObject());
			return;
		}

		// 方法名
		String method = request.getParameter("m");
		// SN
		String sn = request.getParameter("sn");

		JSONObject json = null;

		java.util.List<Archive> list = ArchiveManager.getInstance().listArchives(account);
		if (null == list) {
			json = new JSONObject();
			try {
				json.put("size", 0);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		else {
			JSONArray array = new JSONArray();
			for (Archive archive : list) {
				array.put(archive.toJSON());
			}

			json = new JSONObject();
			try {
				json.put("size", list.size());
				json.put("list", array);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}

		StringBuilder script = new StringBuilder();
		script.append(method).append(".call(null,\"").append(sn).append("\",").append(json.toString()).append(");");

		// 返回数据
		Helper.respondWithOk(response, script.toString());
	}
}
