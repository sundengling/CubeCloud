package cube.engine.sharing;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Vector;
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

/**
 * 分享管理器。
 */
public final class SharingManager implements ConvertTaskListener {

	private final static SharingManager instance = new SharingManager();

	private File repositoryPath;
	private int sizeThreshold;
	private long fileSizeMax;

	private String storePath;
	private String tmpPath;
	private String workPath;

	private String fileUrlPrefix;

	private DiskFileItemFactory factory;

	private ConcurrentHashMap<String, SharedFile> taskTagFileMap;

	private List<SharedFile> sharedFileList;

	private SharingManager() {
		this.taskTagFileMap = new ConcurrentHashMap<String, SharedFile>();
		this.sharedFileList = new Vector<SharedFile>();
	}

	public static SharingManager getInstance() {
		return SharingManager.instance;
	}

	/**
	 * 初始化。
	 * @param storePath
	 * @param repositoryPath
	 * @param workPath
	 * @param urlPrefix
	 * @param sizeThreshold
	 * @param fileSizeMax
	 */
	public void init(String storePath, String repositoryPath, String workPath, String urlPrefix, int sizeThreshold, long fileSizeMax) {
		Logger.d(this.getClass(), "Sharing manager init: " + repositoryPath);

		this.storePath = storePath.toString();
		if (!this.storePath.endsWith("/")) {
			this.storePath += "/";
		}

		File sp = new File(this.storePath);
		if (!sp.exists()) {
			if (sp.mkdirs()) {
				Logger.d(this.getClass(), "Sharing manager mkdirs " + this.storePath + " sucessed");
			}
			else {
				Logger.d(this.getClass(), "Sharing manager mkdirs " + this.storePath + " failed");
			}
		}
		sp = null;

		this.workPath = workPath.toString();
		if (!this.workPath.endsWith("/")) {
			this.workPath += "/";
		}
		File wp = new File(this.workPath);
		if (!wp.exists()) {
			if (wp.mkdirs()) {
				Logger.d(this.getClass(), "Sharing manager mkdirs " + this.workPath + " sucessed");
			}
			else {
				Logger.d(this.getClass(), "Sharing manager mkdirs " + this.workPath + " failed");
			}
		}
		wp = null;

		this.fileUrlPrefix = urlPrefix.toString();

		this.tmpPath = repositoryPath.toString();
		this.repositoryPath = new File(this.tmpPath);
		if (!this.repositoryPath.exists()) {
			if (this.repositoryPath.mkdirs()) {
				Logger.d(this.getClass(), "Sharing manager mkdirs " + this.repositoryPath + " sucessed");
			}
			else {
				Logger.d(this.getClass(), "Sharing manager mkdirs " + this.repositoryPath + " failed");
			}
		}

		this.sizeThreshold = sizeThreshold;
		this.fileSizeMax = fileSizeMax;

		this.factory = new DiskFileItemFactory();
		this.factory.setSizeThreshold(this.sizeThreshold);
		this.factory.setRepository(this.repositoryPath);
	}

	/**
	 * 销毁
	 */
	public void destroy() {
		Logger.d(this.getClass(), "Sharing manager destroy");
	}

	/**
	 * 接收文件数据。
	 * 
	 * @param name
	 * @param request
	 */
	public void receive(String name, HttpServletRequest request) {
		ServletFileUpload upload = new ServletFileUpload(this.factory);
		upload.setSizeMax(this.fileSizeMax);
		upload.setHeaderEncoding("UTF-8");

		// 设置文件上传进度监听器
		FileProgressListener pl = new FileProgressListener(name, request.getSession());
		upload.setProgressListener(pl);

		try {
			List<FileItem> items = upload.parseRequest(request);

			for (FileItem item : items) {
				if (!item.isFormField()) {
					// 原始文件名
					String originFileName = item.getName();

					// 文件后缀名
					String extension = FileUtils.extractFileExtension(originFileName);

					// 文件别名
					String aliasFileName = Utils.randomString(32) + "." + extension;

					FileType fileType = FileType.parseType(extension);

					if (FileType.UNKNOWN != fileType) {
						// 存储路径
						String strFilePath = this.storePath + name + "/";

						// 创建工作目录
						File filePath = new File(this.workPath + name + "/");
						if (!filePath.exists()) {
							filePath.mkdirs();
						}
						// 创建存储目录
						filePath = new File(strFilePath);
						if (!filePath.exists()) {
							filePath.mkdirs();
						}
						filePath = null;

						// 删除相同文件
						SharedFile sf = this.existSharedFile(originFileName);
						if (null != sf) {
							sf.delete();
							this.removeSharedFile(sf);
						}

						// 原文件
						File originFile = new File(strFilePath, originFileName);
						// 别名文件
						File aliasFile = new File(this.workPath + name + "/", aliasFileName);

						sf = new SharedFile(name, originFile, aliasFile, fileType, request.getSession());

						// 添加分享文件
						this.addSharedFile(sf);

						synchronized (pl.files) {
							pl.files.add(sf);
						}

						// 写文件
						item.write(originFile);

						request.getSession().setAttribute("name", name);
						request.getSession().setAttribute("filename", originFileName);
					}
					else {
						// 不支持的类型
						Logger.w(this.getClass(), "不支持的文件类型: " + originFileName);

						request.getSession().setAttribute("name", name);
						request.getSession().setAttribute("filename", originFileName);
						request.getSession().setAttribute("state", 300);
					}
				}
			}

			// 结束
			pl.finish();
		} catch (FileUploadException e) {
			Logger.log(this.getClass(), e, LogLevel.ERROR);
		} catch (Exception e) {
			Logger.log(this.getClass(), e, LogLevel.ERROR);
		}		
	}

	@Override
	public void onConvertContacted(String identifier, String tag) {
		// TODO 已连接转换服务器
		Logger.d(this.getClass(), " Contacted: " + identifier + " Tag : " + tag);
	}
	
	@Override
	public void onQueueing(ConvertTask task) {
		Logger.d(this.getClass(), " ConvertTask: " + task.getTaskTag() + " Queueing ");
	}

	@Override
	public void onStarted(ConvertTask task) {
		SharedFile sf = this.taskTagFileMap.get(task.getTaskTag());
		if (null != sf) {
			Logger.d(this.getClass(), " ConvertTask: " + task.getTaskTag() + " Started");
			sf.getHttpSession().setAttribute("convertstate", "started");
		}
	}
	
	@Override
	public void onExecuting(ConvertTask task) {
		SharedFile sf = this.taskTagFileMap.get(task.getTaskTag());
		if (null != sf) {
			Logger.d(this.getClass(), " ConvertTask: " + task.getTaskTag() + " Executing");
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
		
		//组装图片访问 URL
		for (String uri : uriList) {
			String url = this.fileUrlPrefix + uri;
			sf.appendUrl(url);
		}
		
		sf.getHttpSession().setAttribute("file", sf.toJSON());
		
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

	/**
	 * 文件进度监听器。
	 */
	protected class FileProgressListener implements ProgressListener {
		private String name;
		private HttpSession session;

		protected List<SharedFile> files;

		private AtomicBoolean finish;

		protected FileProgressListener(String name, HttpSession session) {
			this.name = name;
			this.session = session;
			this.files = new LinkedList<SharedFile>();
			this.finish = new AtomicBoolean(false);

			this.session.setAttribute("bytesread", 0);
			this.session.setAttribute("contentlength", 0);
			this.session.setAttribute("state", 0);
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
			this.session.setAttribute("state", 100);

			Logger.d(this.getClass(), "Update progress: read: " + bytesRead + ", contentLength : " + contentLength);

			if (bytesRead == contentLength) {
				// 启动线程
				// TODO 改为使用线程池
				(new Thread() {
					@Override
					public void run() {
						while (!finish.get()) {
							try {
								Thread.sleep(1000);
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
							continue;
						}

						synchronized (files) {
							for (SharedFile sf : files) {
								// 如果文件为图片格式，则跳过，否则转换为png格式
								if (sf.getType() == FileType.PNG || sf.getType() == FileType.JPG
									|| sf.getType() == FileType.JPEG || sf.getType() == FileType.GIF
									|| sf.getType() == FileType.BMP) {
									// 文件直接写入工作目录
									boolean ret = copyFile(sf.getOriginFile(), sf.getAliasFile());
									if (ret) {
										// 生成 URL
										String fileURL = fileUrlPrefix + name + "/" + sf.getAliasFile().getName();
										sf.appendUrl(fileURL);

										// 设置状态
										session.setAttribute("state", 200);
										session.setAttribute("converting", false);
										session.setAttribute("file", sf.toJSON());
									}
									else {
										// 发生错误
										session.setAttribute("state", 500);
									}
								}
								else {
									boolean ret = copyFile(sf.getOriginFile(), sf.getAliasFile());
									if (ret) {
										// 进行文件转换
										session.setAttribute("state", 200);
										session.setAttribute("converting", true);
										session.setAttribute("file", sf.toJSON());

										// 启动转换
										startConverting(sf);
									}
								}
							}
						}
					}
				}).start();
			}
		}
	}

	protected String startConverting(SharedFile file) {
		Logger.d(this.getClass(), "startConverting:" + file.getAliasFile().getAbsolutePath());
		ConvertTask task = new ConvertTask(file.getAliasFile().getAbsolutePath(), this.workPath);

		taskTagFileMap.put(task.getTaskTag(), file);
		ConvertTool.getInstance().addConvertTask(task);

		return task.getTaskTag();
	}

	private SharedFile existSharedFile(String filename) {
		SharedFile sharedFile = null;
		if (!this.sharedFileList.isEmpty()) {
			for (SharedFile sf : this.sharedFileList) {
				if (sf.getOriginFile().getName().equals(filename)) {
					sharedFile = sf;
					break;
				}
			}
		}
		return sharedFile;
	}

	private void addSharedFile(SharedFile file) {
		this.sharedFileList.add(file);
	}

	private boolean removeSharedFile(SharedFile file) {
		return this.sharedFileList.remove(file);
	}

	/**
	 * 复制文件。
	 * 
	 * @param srcFile
	 * @param destFile
	 * @return
	 */
	private boolean copyFile(File srcFile, File destFile) {
		boolean flag = false;
		FileInputStream fis = null;
		FileOutputStream fos = null;
		try {
			fis = new FileInputStream(srcFile);
			fos = new FileOutputStream(destFile);

			byte[] b = new byte[2048];
			int len = 0;

			while ((len = fis.read(b)) != -1) {
				fos.write(b, 0, len);
			}

			fos.flush();

			flag = true;
		} catch (FileNotFoundException e) {
			flag = false;
			e.printStackTrace();
		} catch (IOException e) {
			flag = false;
			e.printStackTrace();
		} finally {
			try {
				if (fis != null) {
					fis.close();
				}

				if (fos != null) {
					fos.close();
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		return flag;
	}
}
