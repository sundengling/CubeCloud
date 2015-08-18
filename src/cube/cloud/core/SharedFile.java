package cube.cloud.core;

import java.io.File;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpSession;

import cube.cloud.db.dao.SharedFileDao;
import cube.cloud.db.dao.impl.SharedFileDaoImpl;

/**
 * 
 */
public class SharedFile {
	private long fileId;
	private File file;
	private FileType type;
	private String fileRealName;
	private HttpSession session;

	private List<String> urlList;

	public SharedFile(File file, String fileRealName, FileType type, HttpSession session) {
		this.file = file;
		this.fileRealName = fileRealName;
		this.type = type;
		this.session = session;
		this.urlList = new LinkedList<String>();
	}

	public SharedFile(long fileId, File file, String fileRealName, FileType type) {
		this.fileId = fileId;
		this.file = file;
		this.fileRealName = fileRealName;
		this.type = type;
		this.urlList = new LinkedList<String>();
	}

	public void setFileId(long fileId) {
		this.fileId = fileId;
	}
	
	public long getFileId() {
		return this.fileId;
	}
	
	public void setFileRealName(String fileRealName) {
		this.fileRealName = fileRealName;
	}
	
	public String getFileRealName() {
		return this.fileRealName;
	}
	
	public File getFile() {
		return this.file;
	}
	
	public void setFile(File f) {
		this.file = f;
	}

	public FileType getType() {
		return this.type;
	}

	public HttpSession getHttpSession() {
		return this.session;
	}
	
	public List<String> getUrlList() {
		List<String> urls = this.urlList;
		if(null == urls || urls.isEmpty()){
			SharedFileDao sharedFileDao = new SharedFileDaoImpl();
			urls = sharedFileDao.findSharedFileSplit(this.getFileRealName());
		}
		return urls;
	}

	public void addUrlList(List<String> urlList) {
		this.urlList.addAll(urlList);
		
		SharedFileDao sharedFileDao = new SharedFileDaoImpl();
		List<String> urls = sharedFileDao.findSharedFileSplit(this.getFileRealName());
		if(urls == null || urls.size() <= 0){
			for (String url : urlList) {
				//写入数据库
				sharedFileDao.addSharedFileSplit(url, this.getFileRealName());
			}
		}
	}

	public void delete() {
		if (null != this.file && this.file.exists()) {
			this.file.delete();
		}
	}
}
