package cube.engine.archive;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.servlet.http.HttpServletRequest;

import net.cellcloud.common.Base64;
import net.cellcloud.common.LogLevel;
import net.cellcloud.common.Logger;
import net.cellcloud.util.CachedQueueExecutor;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 存档管理器。
 */
public final class ArchiveManager {

	private static ArchiveManager instance = new ArchiveManager();

	private String storePath;
	private String tempPath;
	private String workPath;

	private String ffmpeg;

	private CachedQueueExecutor executor;

	private ConcurrentHashMap<String, LinkedList<Archive>> archives;

	private LinkedList<ArchiveListener> listeners;

	private AtomicBoolean concating;
	private Timer concatTimer;

	private ArchiveManager() {
		this.archives = new ConcurrentHashMap<String, LinkedList<Archive>>();
		this.listeners = new LinkedList<ArchiveListener>();
		this.concating = new AtomicBoolean(false);
	}

	public static ArchiveManager getInstance() {
		return ArchiveManager.instance;
	}

	public void init(String storePath, String repositoryPath, String workPath) {
		if (null == this.executor) {
			this.executor = CachedQueueExecutor.newCachedQueueThreadPool(8);
		}

		if (null == this.concatTimer) {
			this.concatTimer = new Timer();
			// 每 1 小时执行一次
			this.concatTimer.scheduleAtFixedRate(new ConcatTask(), 10 * 1000, 60 * 60 * 1000);
		}

		this.storePath = storePath.toString();
		this.tempPath = repositoryPath.toString();
		this.workPath = workPath.toString();

		Logger.d(this.getClass(), "Store path: " + this.storePath);
		Logger.d(this.getClass(), "Temp path: " + this.tempPath);
		Logger.d(this.getClass(), "Work path: " + this.workPath);

		// 检测 FFMPEG 命令路径
		File file = new File("/usr/local/bin/ffmpeg");
		if (file.exists()) {
			this.ffmpeg = "/usr/local/bin/ffmpeg";
		}
		else {
			file = new File("/usr/bin/ffmpeg");
			if (file.exists()) {
				this.ffmpeg = "/usr/bin/ffmpeg";
			}
			else {
				file = new File("/home/lztxhost/bin/ffmpeg");
				if (file.exists()) {
					this.ffmpeg = "/home/lztxhost/bin/ffmpeg";
				}
			}
		}

		if (null == this.ffmpeg) {
			Logger.w(this.getClass(), "Can NOT find ffmpeg tool.");
			this.ffmpeg = "~/bin/ffmpeg";
		}

		Logger.i(this.getClass(), "ffmpeg path: " + this.ffmpeg);

		this.executor.execute(new Runnable() {
			@Override
			public void run() {
				loadArchives();
			}
		});
	}

	public void dispose() {
		if (null != this.concatTimer) {
			this.concatTimer.cancel();
			this.concatTimer.purge();
			this.concatTimer = null;
		}
	}

	public void addListener(ArchiveListener listener) {
		synchronized (this.listeners) {
			if (this.listeners.contains(listener)) {
				return;
			}

			this.listeners.add(listener);
		}
	}

	public void removeListener(ArchiveListener listener) {
		synchronized (this.listeners) {
			this.listeners.remove(listener);
		}
	}

	public JSONObject archive(HttpServletRequest request) {
		JSONObject json = new JSONObject();

		String account = "";
		JSONObject param = null;

		String videoFileName = null;
		int videoFileSize = 0;
		byte[] videoFileData = null;

		String audioFileName = null;
		int audioFileSize = 0;
		byte[] audioFileData = null;

		try {
			BufferedReader reader = request.getReader();
			String line = null;
			while((line = reader.readLine()) != null) {
				if (line.indexOf("param") >= 0) {
					while ((line = reader.readLine()) != null) {
						if (line.length() > 0) {
							try {
								param = new JSONObject(line.toString());

								if (param.has("account")) {
									account = param.getString("account");
								}
							} catch (JSONException e) {
								e.printStackTrace();
							}
							break;
						}
					}
				}
				else if (line.indexOf("video-filename") >= 0) {
					while ((line = reader.readLine()) != null) {
						if (line.length() > 0) {
							videoFileName = line.toString();
							break;
						}
					}
				}
				else if (line.indexOf("video-size") >= 0) {
					while ((line = reader.readLine()) != null) {
						if (line.length() > 0) {
							videoFileSize = Integer.parseInt(line);
							break;
						}
					}
				}
				else if (line.indexOf("video-data") >= 0) {
					while ((line = reader.readLine()) != null) {
						if (line.length() > 0) {
							line = line.split(",")[1];
							videoFileData = Base64.decode(line);
							break;
						}
					}
				}
				else if (line.indexOf("audio-filename") >= 0) {
					while ((line = reader.readLine()) != null) {
						if (line.length() > 0) {
							audioFileName = line.toString();
							break;
						}
					}
				}
				else if (line.indexOf("audio-size") >= 0) {
					while ((line = reader.readLine()) != null) {
						if (line.length() > 0) {
							audioFileSize = Integer.parseInt(line);
							break;
						}
					}
				}
				else if (line.indexOf("audio-data") >= 0) {
					while ((line = reader.readLine()) != null) {
						if (line.length() > 0) {
							line = line.split(",")[1];
							audioFileData = Base64.decode(line);
							break;
						}
					}
				}
			}

			if (Logger.isDebugLevel()) {
				if (null != videoFileName)
					Logger.d(this.getClass(), "Save file: " + videoFileName + "#" + videoFileData.length + " - " + videoFileSize);

				if (null != audioFileName)
					Logger.d(this.getClass(), "Save file: " + audioFileName + "#" + audioFileData.length + " - " + audioFileSize);
			}

			String path = this.storePath + account + "/";
			File fp = new File(path);
			if (!fp.exists()) {
				fp.mkdirs();
			}

			File videoFile = null;
			if (null != videoFileName) {
				videoFile = new File(path + videoFileName);
				FileOutputStream out = new FileOutputStream(videoFile);
				out.write(videoFileData);
				out.flush();
				out.close();
			}

			File audioFile = null;
			if (null != audioFileName) {
				audioFile = new File(path + audioFileName);
				FileOutputStream out = new FileOutputStream(audioFile);
				out.write(audioFileData);
				out.flush();
				out.close();
			}

			synchronized (this.listeners) {
				for (ArchiveListener l : this.listeners) {
					l.onSaved(param, videoFile, audioFile);
				}
			}

			String outputFilename = null;
			if (null != videoFile && null != audioFile) {
				int index = videoFileName.lastIndexOf(".");
				outputFilename = this.merge(account, path + videoFileName.substring(0, index) + "_merge.webm", videoFile, audioFile, param);
			}
			else if (null != videoFile) {
				outputFilename = this.convert(account, path + videoFileName, videoFile, param);
			}

			synchronized (this.listeners) {
				for (ArchiveListener l : this.listeners) {
					l.onArchiving(param, outputFilename);
				}
			}

			try {
				json.put("account", account);
				if (null != videoFileName) {
					int index = videoFileName.lastIndexOf(".");
					json.put("file", videoFileName.substring(0, index));
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} catch (IOException e) {
			Logger.log(this.getClass(), e, LogLevel.ERROR);

			try {
				json.put("account", account);
				json.put("error", e.getMessage());
			} catch (JSONException je) {
				je.printStackTrace();
			}
		}

		return json;
	}

	private String merge(final String account, final String outFile, final File vidoeFile, final File audioFile, final JSONObject param) {
		int index = outFile.lastIndexOf(".");
		final String mp4File = outFile.substring(0, index) + ".mp4";

		this.executor.execute(new Runnable() {
			@Override
			public void run() {
				// 合并
				StringBuilder command = new StringBuilder();
				command.append(ffmpeg);
				command.append(" -i \"");
				command.append(vidoeFile.getAbsolutePath());
				command.append("\" -i \"");
				command.append(audioFile.getAbsolutePath());
				command.append("\" -map 0:0 -map 1:0 ");
				command.append(outFile);

//				Logger.d(this.getClass(), "merge: " + command);

				Process p = null;
				try {
					p = Runtime.getRuntime().exec(new String[]{"/bin/sh", "-c", command.toString()});
					p.waitFor();
					p.destroy();
				} catch (IOException e) {
					e.printStackTrace();
				} catch (InterruptedException e) {
					e.printStackTrace();
				} finally {
					p = null;
				}

				// 转为 mp4
				// ffmpeg -fflags +genpts -i a.webm -strict -2 -r 24 a.mp4

				command = new StringBuilder();
				command.append(ffmpeg);
				command.append(" -fflags +genpts -i \"");
				command.append(outFile);
				command.append("\" -strict -2 -r 24 \"");
				command.append(mp4File);
				command.append("\"");

//				Logger.d(this.getClass(), "convert: " + command);

				try {
					p = Runtime.getRuntime().exec(new String[]{"/bin/sh", "-c", command.toString()});
					p.waitFor();
					p.destroy();
				} catch (IOException e) {
					e.printStackTrace();
				} catch (InterruptedException e) {
					e.printStackTrace();
				} finally {
					p = null;
				}

				command = null;

				File file = new File(mp4File);
				Archive archive = new Archive(account, file);
				addArchive(archive);

				synchronized (listeners) {
					for (ArchiveListener l : listeners) {
						l.onArchiveCompleted(param, file);
					}
				}
			}
		});

		return mp4File;
	}

	private String convert(final String account, final String outFile, final File vidoeFile, final JSONObject param) {
		int index = outFile.lastIndexOf(".");
		final String mp4File = outFile.substring(0, index) + ".mp4";

		this.executor.execute(new Runnable() {
			@Override
			public void run() {
				// 转为 mp4
				//ffmpeg -fflags +genpts -i a.webm -strict -2 -r 24 a.mp4
				StringBuilder command = new StringBuilder();
				command.append(ffmpeg);
				command.append(" -fflags +genpts -i \"");
				command.append(outFile);
				command.append("\" -strict -2 -r 24 \"");
				command.append(mp4File);
				command.append("\"");

//				Logger.d(this.getClass(), "convert: " + command);

				Process p = null;
				try {
					p = Runtime.getRuntime().exec(new String[]{"/bin/sh", "-c", command.toString()});
					p.waitFor();
					p.destroy();
				} catch (IOException e) {
					e.printStackTrace();
				} catch (InterruptedException e) {
					e.printStackTrace();
				} finally {
					p = null;
				}

				command = null;

				File file = new File(mp4File);
				Archive archive = new Archive(account, file);
				addArchive(archive);

				synchronized (listeners) {
					for (ArchiveListener l : listeners) {
						l.onArchiveCompleted(param, file);
					}
				}
			}
		});

		return mp4File;
	}

	private String concat(final List<Archive> inputFiles) {
//		String tmpFilename = inputFiles.get(0).getPrefix() + ".mp4";
//
//		for (Archive archive : inputFiles) {
//			
//		}

		return null;
	}

	public List<Archive> listArchives(String account) {
		LinkedList<Archive> list = this.archives.get(account);
		if (null != list) {
			return list;
		}

		File path = new File(this.storePath + account);
		if (path.exists() && path.isDirectory()) {
			// 新列表
			list = new LinkedList<Archive>();

			String[] filelist = path.list();
			for (String name : filelist) {
				if (name.endsWith("mp4")) {
					Archive archive = new Archive(account, new File(path, name));
					if (archive.correct()) {
						list.add(archive);
					}
				}
			}

			// 写入 Map
			this.archives.put(account, list);
		}

		return list;
	}

	public Archive getArchive(String account, String fileName) {
		LinkedList<Archive> list = this.archives.get(account);
		if (null == list) {
			return null;
		}

		synchronized (list) {
			for (Archive archive : list) {
				if (archive.getFileName().equals(fileName)) {
					return archive;
				}
			}
		}

		return null;
	}

	private void addArchive(Archive archive) {
		LinkedList<Archive> list = this.archives.get(archive.getAccount());
		if (null == list) {
			list = new LinkedList<Archive>();
			this.archives.put(archive.getAccount(), list);
		}

		synchronized (list) {
			for (Archive a : list) {
				if (a.getFileName().equals(archive.getFileName())) {
					return;
				}
			}

			list.add(archive);
		}
	}

	private void loadArchives() {
		File path = new File(this.storePath);
		if (!path.exists() || !path.isDirectory()) {
			return;
		}

		File[] pathList = path.listFiles();
		if (null == pathList) {
			return;
		}

		for (File p : pathList) {
			if (p.isDirectory()) {
				String account = p.getName().toString();
				File[] fileList = p.listFiles();
				if (null != fileList) {
					for (File f : fileList) {
						if (f.getName().endsWith("mp4")) {
							Archive archive = new Archive(account, f);
							if (archive.correct()) {
								this.addArchive(archive);

								if (Logger.isDebugLevel()) {
									Logger.i(this.getClass(), "Load archive file '" + f.getName() + "' for '" + account + "'");
								}
							}
						}
					}
				}
			}
		} // end for
	}

	protected class ConcatTask extends TimerTask {
		protected ConcatTask() {
			
		}

		@Override
		public void run() {
			if (concating.get()) {
				return;
			}

			concating.set(true);

			long time = System.currentTimeMillis();
			long delta = 3600000;

			try {
				for (Map.Entry<String, LinkedList<Archive>> entry : archives.entrySet()) {
//					String account = entry.getKey();

					HashMap<String, LinkedList<Archive>> prefixMap = new HashMap<String, LinkedList<Archive>>();

					LinkedList<Archive> list = entry.getValue();

					// 排序
					Collections.sort(list);

					synchronized (list) {
						for (Archive a : list) {
							// 前缀长度小于10，则前缀不合规，不需要拼接
							if (a.getPrefix().length() < 10) {
								continue;
							}

							LinkedList<Archive> archiveList = prefixMap.get(a.getPrefix());
							if (null == archiveList) {
								archiveList = new LinkedList<Archive>();
								prefixMap.put(a.getPrefix(), archiveList);
							}

							archiveList.add(a);
						}
					}

					// 检查此账号下是否有需要拼接的文件
					for (LinkedList<Archive> value : prefixMap.values()) {
						if (value.size() > 1) {
							// 检查时间戳，至少 1 小时前的文件才能拼接
							Archive archive = value.get(value.size() - 1);
							if (time - archive.getTimestamp() > delta) {
								// 进行拼接
								concat(value);
							}
						}
					}
				}

//				File path = new File(storePath);
//				if (path.exists() && path.isDirectory()) {
//					File[] pathList = path.listFiles();
//					if (null != pathList) {
//						for (File p : pathList) {
//							if (p.isDirectory()) {
//								File[] fileList = p.listFiles();
//							}
//						}
//					}
//				}
			} catch (Exception e) {
				Logger.log(ArchiveManager.class, e, LogLevel.ERROR);
			} finally {
				concating.set(false);
			}
		}
	}
}
