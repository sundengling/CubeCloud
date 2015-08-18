package cube.cloud.core;

import java.io.File;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import net.cellcloud.common.LogLevel;
import net.cellcloud.common.Logger;
import net.cellcloud.util.Utils;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.ProgressListener;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import cube.cloud.util.FileUtils;
import cube.converttools.ConvertTask;
import cube.converttools.ConvertTaskListener;
import cube.converttools.ConvertTool;
import cube.converttools.StateCode;

public final class FileManager implements ConvertTaskListener {

	private final static FileManager instance = new FileManager();

	private File repositoryPath;
	private int sizeThreshold;
	private long fileSizeMax;

	private String storePath;
	private String tmpPath;
	private String workPath;
	private String fileURL;

	private DiskFileItemFactory factory;

	private ConcurrentHashMap<String, SharedFile> taskTagFileMap;

	private FileManager() {
		this.taskTagFileMap = new ConcurrentHashMap<String, SharedFile>();
	}

	public static FileManager getInstance() {
		return FileManager.instance;
	}

	public void activate(String storePath, String repositoryPath, String workPath, String fileUrl,
			int sizeThreshold, long fileSizeMax) {
		Logger.d(this.getClass(), "File manager activated: " + repositoryPath);

		this.storePath = storePath.toString();
		if (!this.storePath.endsWith("/")) {
			this.storePath += "/";
		}
		
		File sp = new File(this.storePath);
		if (!sp.exists()) {
			if (sp.mkdirs()) {
				Logger.d(this.getClass(), "File manager mkdirs " +this.storePath+ " sucessed");
			}
			else {
				Logger.d(this.getClass(), "File manager mkdirs " +this.storePath+ " failed");
			}
		}
		else {
		}
		sp = null;
		
		this.workPath = workPath;
		if(!this.workPath.endsWith("/")) {
			this.workPath += "/";
		}
		File wp = new File(this.workPath);
		if (!wp.exists()) {
			if (wp.mkdirs()) {
				Logger.d(this.getClass(), "File manager mkdirs " + this.workPath + " sucessed");
			}
			else {
				Logger.d(this.getClass(), "File manager mkdirs " + this.workPath + " failed");
			}
		}
		else {
		}
		wp = null;
		
		this.fileURL = fileUrl;
//		Logger.d(this.getClass(), "File url = " + this.fileURL);
		
		this.tmpPath = repositoryPath;
		this.repositoryPath = new File(this.tmpPath);
		if (!this.repositoryPath.exists()) {
			if (this.repositoryPath.mkdirs()) {
				Logger.d(this.getClass(), "File manager mkdirs " +this.repositoryPath+ " sucessed");
			}
			else {
				Logger.d(this.getClass(), "File manager mkdirs " +this.repositoryPath+ " failed");
			}
		}
		else {
		}

		this.sizeThreshold = sizeThreshold;
		this.fileSizeMax = fileSizeMax;

		// /Applications/eclipse/Eclipse.app/Contents/MacOS/.

		this.factory = new DiskFileItemFactory();
		this.factory.setSizeThreshold(this.sizeThreshold);
		this.factory.setRepository(this.repositoryPath);
	}

	public void deactivate() {
		Logger.d(this.getClass(), "File manager deactivate");
	}

	public void receive(Tenant tenant, HttpServletRequest request) {
		ServletFileUpload upload = new ServletFileUpload(this.factory);
		upload.setSizeMax(this.fileSizeMax);
		upload.setHeaderEncoding("UTF-8");

		// 设置文件上传进度监听器
		FileProgressListener pl = new FileProgressListener(tenant, request.getSession());
		upload.setProgressListener(pl);

		try {
			List<FileItem> items = upload.parseRequest(request);

			for (FileItem item : items) {
				if (!item.isFormField()) {
					String fileName = item.getName();
					
					String extension = FileUtils.extractFileExtension(fileName);
					String fileAliasName = Utils.randomString(32).toLowerCase() + "." + extension;
					
//					String lowerFileName = fileName.toLowerCase();
//					String extension = FileUtils.extractFileExtension(lowerFileName);
					
					FileType fileType = FileType.parseType(extension);
					if (FileType.UNKNOWN != fileType) {
						// 计算存储路径
						String filePath = this.storePath + tenant.getName() + "/";
						File file = new File(filePath);
						if (!file.exists()) {
							file.mkdirs();
						}

						//相同文件
						SharedFile sf = tenant.existSharedFile(fileName);
						if (null != sf) {
							sf.delete();
							tenant.removeSharedFile(sf);
						}

						file = new File(filePath + fileAliasName);
						sf = new SharedFile(file, fileName, fileType, request.getSession());
						sf.getHttpSession().setAttribute("filename", fileAliasName);

						tenant.addSharedFile(sf);

						synchronized (pl.files) {
							pl.files.add(sf);
						}
						// 写文件
						item.write(file);
					}
					else {
						// 不支持的类型
						Logger.w(this.getClass(), "不支持的文件类型: " + fileName);
					}
				}
			}
			pl.finish();
		} catch (FileUploadException e) {
			Logger.log(this.getClass(), e, LogLevel.ERROR);
		} catch (Exception e) {
			Logger.log(this.getClass(), e, LogLevel.ERROR);
		}		
	}

	private String convertToPNG(SharedFile sf, String outPut) {
		ConvertTask task = new ConvertTask(sf.getFile().getAbsolutePath(), outPut);

		taskTagFileMap.put(task.getTaskTag(), sf);
		ConvertTool.getInstance().addConvertTask(task);

		return task.getTaskTag();
	}
	
	public List<String> requestFileUrlList(String name, Tenant tenant) {
		List<String> urlList = null;		
		List<SharedFile> sharedFileList = tenant.getSharedFileList();
		if (!sharedFileList.isEmpty()) {
			for (SharedFile sf : sharedFileList ) {
				if (sf.getFile().getName().equals(name)) {
					urlList = sf.getUrlList();
					break;
				}
			}
		}

		return urlList;
	}
	
	@Override
	public void onConvertContacted(String identifier, String tag) {
		// TODO 已连接转换服务器
		Logger.d(this.getClass(), " Contacted: " + identifier
				+ " Tag : " + tag);
	}
	
	@Override
	public void onQueueing(ConvertTask task) {
		Logger.d(this.getClass(), " ConvertTask: " + task.getTaskTag()
				+ " Queueing ");
	}

	@Override
	public void onStarted(ConvertTask task) {
		SharedFile sf = this.taskTagFileMap.get(task.getTaskTag());
		if (null != sf) {
			Logger.d(this.getClass(), " ConvertTask: " + task.getTaskTag()
					+ " Started");
			sf.getHttpSession().setAttribute("convertstate", "started");
		}
	}
	
	@Override
	public void onExecuting(ConvertTask task) {
		SharedFile sf = this.taskTagFileMap.get(task.getTaskTag());
		if (null != sf) {
			Logger.d(this.getClass(), " ConvertTask: " + task.getTaskTag()
					+ " Executing");
			sf.getHttpSession().setAttribute("convertstate", "executing");
		}
		
	}

	@Override
	public void onCompleted(ConvertTask task) {
		SharedFile sf = this.taskTagFileMap.get(task.getTaskTag());
		if (null == sf) {
			return;
		}
		Logger.d(this.getClass(), " ConvertTask: taskTag: " + task.getTaskTag()
				+ " state : " + task.getStateCode().getDescription() + " "
				+ " FileURIList : " + task.getConvertedFileURIList().toString());

		List<String> uriList = task.getConvertedFileURIList();
		List<String> urlList = new ArrayList<String>();
		//组装图片访问 URL
		for (String uri : uriList) {
			String url = this.fileURL + uri;
			urlList.add(url);
		}
		sf.addUrlList(urlList);

		sf.getHttpSession().setAttribute("convertstate", "completed");

		this.taskTagFileMap.remove(task.getTaskTag());
	}

	@Override
	public void onTaskFailed(ConvertTask task, StateCode code) {
		// TODO  转换失败
		SharedFile sf = this.taskTagFileMap.get(task.getTaskTag());
		if (null == sf) {
			// TODO Error
			return;
		}
		Logger.d(this.getClass(), " ConvertTask: " + task.getTaskTag()
				+ " Failed : " + code.getDescription()
				+ " FailCode: " + task.getFaileCode()
				+ " FileURIList : " + task.getConvertedFileURIList().toString());
		sf.getHttpSession().setAttribute("convertstate", "failed");

		this.taskTagFileMap.remove(task.getTaskTag());
	}

	protected class FileProgressListener implements ProgressListener {
		private HttpSession session;

		protected List<SharedFile> files = new LinkedList<SharedFile>();

		private AtomicBoolean finish;
		
		private int timer = 0;

		protected FileProgressListener(Tenant tenant, HttpSession session) {
			this.session = session;
			this.finish = new AtomicBoolean(false);
		}

		protected void finish() {
			this.finish.set(true);
		}

		@Override
		public void update(long bytesRead, long contentLength, int items) {
			if (null == this.session) {
				return;
			}

			this.session.setAttribute("bytesread", bytesRead);
			this.session.setAttribute("contentlength", contentLength);

			Logger.d(this.getClass(), " FileUpload: [read: " + bytesRead
					+ " contentLength : " + contentLength + "]");

			if (bytesRead == contentLength) {
				timer++;
				//执行一次
				if (timer == 1){
					//TODO 需要线程池控制，
					(new Thread() {
						@Override
						public void run() {
							while (!finish.get()) {
								try {
									Thread.sleep(1000);
								} catch (InterruptedException e) {
									e.printStackTrace();
								}
							}
							synchronized (files) {
								for (SharedFile sf : files) {
									convertToPNG(sf, workPath);
								}
							}
						}
					}).start();
				}
			}
		}
	}
}
