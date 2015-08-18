package cube.cloud.rest.channel;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.cellcloud.common.LogLevel;
import net.cellcloud.common.Logger;

import cube.cloud.StateCode;
import cube.cloud.util.ServletUtils;

/**
 * Servlet implementation class CameraInfo
 */
@WebServlet("/channel/camera/info")
public class CameraInfo extends HttpServlet {
	private static final long serialVersionUID = -2080083227739848759L;

	public CameraInfo() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		cube.cloud.core.Tenant tenant = ServletUtils.verifyWithParameter(request, response);
		if (null == tenant) {
			return;
		}

		String cgn = request.getParameter("cgn");
		if (null == cgn) {
			ServletUtils.respond(response, StateCode.InvalidParameter);
			return;
		}

		BufferedReader reader = null;
		try {
			URL url = new URL(cube.cloud.core.Channel.ConferenceURL + "getmemberlist.php?confnum=" + cgn);
			HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
			httpConn.setDoInput(true);
			httpConn.setUseCaches(false);
			httpConn.setRequestMethod("GET");
			httpConn.setReadTimeout(10000);
			httpConn.connect();

			if (httpConn.getResponseCode() == 200) {
				reader = new BufferedReader(new InputStreamReader(httpConn.getInputStream()));
				StringBuilder buf = new StringBuilder();
				String line = null;
				while ((line = reader.readLine()) != null) {
					buf.append(line);
				}
			}
			else {
				// 访问错误
				ServletUtils.respond(response, StateCode.InternalServerError);
			}

			httpConn.disconnect();
		} catch (IOException e) {
			Logger.log(this.getClass(), e, LogLevel.ERROR);
		} finally {
			if (null != reader) {
				try {
					reader.close();
				} catch (IOException ioe) {
					// Nothing
				}
			}
		}
	}
}
