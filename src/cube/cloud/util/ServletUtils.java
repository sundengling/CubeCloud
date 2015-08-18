package cube.cloud.util;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.cellcloud.common.LogLevel;
import net.cellcloud.common.Logger;

import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.StateCode;
import cube.cloud.core.Tenant;
import cube.cloud.core.TenantCache;

public final class ServletUtils {

	private ServletUtils() {
	}

	public static Tenant verify(HttpServletRequest request, HttpServletResponse response) {
		return ServletUtils.verify(request, response, true, true, true);
	}

	public static Tenant verifyWithCookie(HttpServletRequest request, HttpServletResponse response) {
		return ServletUtils.verify(request, response, false, true, true);
	}

	public static Tenant verifyWithParameter(HttpServletRequest request, HttpServletResponse response) {
		return ServletUtils.verify(request, response, true, false, true);
	}

	public static Tenant verifyWithCookieNoRespond(HttpServletRequest request, HttpServletResponse response) {
		return ServletUtils.verify(request, response, false, true, false);
	}

	public static Tenant verifyWithParameterNoRespond(HttpServletRequest request, HttpServletResponse response) {
		return ServletUtils.verify(request, response, true, false, false);
	}

	protected static Tenant verify(HttpServletRequest request, HttpServletResponse response, boolean checkParameter, boolean checkCookie
			, boolean respond) {
		if (!checkParameter && !checkCookie) {
			if (respond) {
				ServletUtils.respond(response, StateCode.InternalServerError);
			}
			return null;
		}

		String token = null;
		if (checkParameter) {
			token = request.getParameter("token");
			if (null == token) {
				if (respond) {
					ServletUtils.respond(response, StateCode.InvalidParameter);
				}
				return null;
			}
		}

		Cookie cookie = null;
		if (checkCookie) {
			Cookie[] cookies = request.getCookies();
			if (null == cookies) {
				if (respond) {
					ServletUtils.respond(response, StateCode.Unauthorized);
				}
				return null;
			}

			for (Cookie c : cookies) {
				if (c.getName().equals("token")) {
					cookie = c;
					break;
				}
			}

			if (null == cookie) {
				if (respond) {
					ServletUtils.respond(response, StateCode.Unauthorized);
				}
				return null;
			}
		}

		if (checkParameter && checkCookie) {
			boolean auth = token.equals(cookie.getValue());

			if (!auth) {
				if (respond) {
					ServletUtils.respond(response, StateCode.IllegalToken);
				}
				return null;
			}
		}

		if (null == token) {
			token = cookie.getValue();
		}

		Tenant tenant = TenantCache.getInstance().getByToken(token);
		if (null == tenant) {
			if (respond) {
				ServletUtils.respond(response, StateCode.ExpiredToken);
			}
			return null;
		}

		return tenant;
	}

	public static void respond(HttpServletResponse response, StateCode stateCode) {
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(HttpServletResponse.SC_OK);

		JSONObject data = new JSONObject();
		try {
			data.put("state", stateCode.getCode());
		} catch (JSONException e) {
			e.printStackTrace();
		}

		PrintWriter out = null;
		try {
			out = response.getWriter();
			out.print(data.toString());
		} catch (IOException e) {
			Logger.log(ServletUtils.class, e, LogLevel.WARNING);
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

		JSONObject ret = new JSONObject();
		try {
			ret.put("state", StateCode.Ok.getCode());
			ret.put("data", data);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		PrintWriter out = null;
		try {
			out = response.getWriter();
			out.print(ret.toString());
		} catch (IOException e) {
			Logger.log(ServletUtils.class, e, LogLevel.WARNING);
		} finally {
			try {
				out.close();
			} catch (Exception e) {
				// Nothing
			}
		}
	}

	public static String getRealIP() throws SocketException {
		String localip = null;	// 本地IP，如果没有配置外网IP则返回它
		String netip = null;	// 外网IP

		Enumeration<NetworkInterface> netInterfaces = NetworkInterface.getNetworkInterfaces();
		InetAddress ip = null;
		boolean finded = false;	// 是否找到外网IP
		while (netInterfaces.hasMoreElements() && !finded) {
			NetworkInterface ni = netInterfaces.nextElement();
			Enumeration<InetAddress> address = ni.getInetAddresses();
			while (address.hasMoreElements()) {
				ip = address.nextElement();
				if (!ip.isSiteLocalAddress()
						&& !ip.isLoopbackAddress()
						&& ip.getHostAddress().indexOf(":") == -1) {
					// 外网IP
					netip = ip.getHostAddress();
					finded = true;
					break;
				}
				else if (ip.isSiteLocalAddress()
						&& !ip.isLoopbackAddress()
						&& ip.getHostAddress().indexOf(":") == -1) {
					// 内网IP
					localip = ip.getHostAddress();
				}
			}
		}

		if (netip != null && !"".equals(netip)) {
			return netip;
		}
		else {
			return localip;
		}
	}
}
