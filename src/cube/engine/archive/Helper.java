package cube.engine.archive;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletResponse;

import net.cellcloud.common.LogLevel;
import net.cellcloud.common.Logger;

import org.json.JSONObject;

public final class Helper {

	private Helper() {
	}

	public static void respondWithOk(HttpServletResponse response, String jsCode) {
		response.setContentType("application/javascript");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(HttpServletResponse.SC_OK);

		PrintWriter out = null;
		try {
			out = response.getWriter();
			out.print(jsCode);
		} catch (IOException e) {
			Logger.log(ArchiveManager.class, e, LogLevel.WARNING);
		} finally {
			try {
				out.close();
			} catch (Exception e) {
				// Nothing
			}
		}
	}

	public static void respondWithOk(HttpServletResponse response, JSONObject data) {
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(HttpServletResponse.SC_OK);

		PrintWriter out = null;
		try {
			out = response.getWriter();
			out.print(data.toString());
		} catch (IOException e) {
			Logger.log(ArchiveManager.class, e, LogLevel.WARNING);
		} finally {
			try {
				out.close();
			} catch (Exception e) {
				// Nothing
			}
		}
	}

	public static void respondWith(HttpServletResponse response, int status, JSONObject data) {
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(status);

		PrintWriter out = null;
		try {
			out = response.getWriter();
			out.print(data.toString());
		} catch (IOException e) {
			Logger.log(ArchiveManager.class, e, LogLevel.WARNING);
		} finally {
			try {
				out.close();
			} catch (Exception e) {
				// Nothing
			}
		}
	}
}
