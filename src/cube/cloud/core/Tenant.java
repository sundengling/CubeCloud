package cube.cloud.core;

import java.util.List;
import java.util.Vector;

import net.cellcloud.util.Clock;
import net.cellcloud.util.Utils;

import org.json.JSONException;
import org.json.JSONObject;

import cube.cloud.db.dao.SharedFileDao;
import cube.cloud.db.dao.impl.SharedFileDaoImpl;
import cube.cloud.util.FileUtils;

public class Tenant {
	private long tenantId;
	private String name;
	private String password;
	private String token;
	private String cubeAccount;

	private String displayName;
	private String face;

	private List<SharedFile> sharedFileList;

	protected boolean guest = false;

	protected long timestamp;

	public Tenant(String name, String password) {
		this.name = name;
		this.password = password;
		this.token = Utils.randomString(32);
		this.cubeAccount = CubeAccountPool.allocAccount();
		this.sharedFileList = new Vector<SharedFile>();
		this.face = "assets/face/default.png";
		this.timestamp = Clock.currentTimeMillis();
	}

	public Tenant(long tenantId, String name, String password) {
		this.tenantId = tenantId;
		this.name = name;
		this.password = password;
		this.token = Utils.randomString(32);
		this.cubeAccount = CubeAccountPool.allocAccount();
		this.sharedFileList = new Vector<SharedFile>();
		this.face = "assets/face/default.png";
		this.timestamp = Clock.currentTimeMillis();
	}

	protected String resetToken() {
		this.token = Utils.randomString(32);
		return this.token;
	}

	protected String resetCubeAccount() {
		if (null != this.cubeAccount) {
			return this.cubeAccount;
		}

		this.cubeAccount = CubeAccountPool.allocAccount();
		return this.cubeAccount;
	}

	public void destroy() {
		if (null != this.cubeAccount) {
			CubeAccountPool.freeAccount(this.cubeAccount);
			this.cubeAccount = null;
		}

		if (null != this.token) {
			this.token = null;
		}
	}

	public String getName() {
		return this.name;
	}

	public String getPassword() {
		return this.password;
	}

	public String getToken() {
		return this.token;
	}

	public String getCubeAccount() {
		return this.cubeAccount;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public String getDisplayName() {
		if (null != this.displayName) {
			return this.displayName;
		}

		int index = 0;
		if ((index = this.name.indexOf("@")) >= 0) {
			this.displayName = this.name.substring(0, index);
			return this.displayName;
		}

		return this.name;
	}

	public void setFace(String face) {
		this.face = face;
	}

	public String getFace() {
		return this.face;
	}

	public boolean isGuest() {
		return this.guest;
	}

	public void refresh() {
		this.timestamp = Clock.currentTimeMillis();
	}

	public List<SharedFile> getSharedFileList() {
		List<SharedFile> fileList = this.sharedFileList;
		if(null == fileList || fileList.isEmpty()){
			SharedFileDao sharedFileDao = new SharedFileDaoImpl();
			fileList = sharedFileDao.findSharedFileByTenantId(this.getTenantId());
		}
		return fileList;
	}

	public void addSharedFile(SharedFile file) {
		this.sharedFileList.add(file);
		
		SharedFileDao sharedFileDao = new SharedFileDaoImpl();
		List<SharedFile> fileList = sharedFileDao.findSharedFile(tenantId, file);
		if(fileList == null || fileList.size() <= 0){
			sharedFileDao.addSharedFile(file, this.getTenantId());
		}
	}

	public boolean removeSharedFile(SharedFile file) {
		return this.sharedFileList.remove(file);
	}

	public long getTenantId() {
		return this.tenantId;
	}

	public void setTenantId(long tenantId) {
		this.tenantId = tenantId;
	}

	public SharedFile existSharedFile(String fileName) {
		if (!this.sharedFileList.isEmpty()) {
			for (SharedFile sf : this.sharedFileList) {
//				if (FileUtils.extractFileName(fileName).equals(
//						FileUtils.extractFileName(sf.getFile().getName()))) {
//					return sf;
//				}
				if (FileUtils.extractFileName(fileName).equals(
						FileUtils.extractFileName(sf.getFileRealName()))) {
					return sf;
				}
				break;
			}
		}
		return null;
	}

	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		try {
			json.put("name", this.name);
			json.put("displayName", this.getDisplayName());
			json.put("face", this.face);
			json.put("cube", this.cubeAccount);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return json;
	}
}
