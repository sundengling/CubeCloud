package cube.engine.sharing;

import java.io.File;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * 可共享文件。
 */
public class SharedFile {

	private long fileId;

	private String account;
	private File originFile;
	private File aliasFile;
	private FileType type;
	private HttpSession session;

	private List<String> urlList;

	public SharedFile(String account, File originFile, File aliasFile, FileType type, HttpSession session) {
		this.account = account;
		this.originFile = originFile;
		this.aliasFile = aliasFile;
		this.type = type;
		this.session = session;
		this.urlList = new LinkedList<String>();
	}

	public SharedFile(long fileId, String account, File originFile, File aliasFile, FileType type, List<String> urlList) {
		this.fileId = fileId;
		this.account = account;
		this.originFile = originFile;
		this.aliasFile = aliasFile;
		this.type = type;
		this.urlList = new LinkedList<String>();
		this.urlList.addAll(urlList);
	}

	public void setFileId(long fileId) {
		this.fileId = fileId;
	}

	public long getFileId() {
		return this.fileId;
	}

	public String getAccount() {
		return this.account;
	}

	public File getOriginFile() {
		return this.originFile;
	}
	
	public File getAliasFile() {
		return this.aliasFile;
	}

	public FileType getType() {
		return this.type;
	}

	public HttpSession getHttpSession() {
		return this.session;
	}

	public List<String> getUrlList() {
		return this.urlList;
	}

	public void appendUrl(String url) {
		this.urlList.add(url);
	}

	public void delete() {
		if (null != this.originFile && this.originFile.exists()) {
			this.originFile.delete();
		}
		if (null != this.aliasFile && this.aliasFile.exists()) {
			this.aliasFile.delete();
		}
	}

	public JSONObject toJSON() {
		JSONObject ret = new JSONObject();
		try {
			ret.put("account", this.account);
			ret.put("origin", this.originFile.getName());
			ret.put("alias", this.aliasFile.getName());
			ret.put("size", this.originFile.length());

			JSONArray list = new JSONArray();
			for (String url : this.urlList) {
				list.put(url);
			}
			ret.put("urls", list);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return ret;
	}
}
