package cube.cloud;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import net.cellcloud.common.LogManager;
import net.cellcloud.common.Logger;
import net.cellcloud.core.Nucleus;
import net.cellcloud.core.NucleusConfig;
import net.cellcloud.exception.SingletonException;
import cube.cloud.core.ChannelFactory;
import cube.cloud.core.CubeAccountPool;
import cube.cloud.core.DispatcherAgent;
import cube.cloud.core.FileManager;
import cube.cloud.db.jdbc.ConnectionFactory;
import cube.converttools.ConvertTool;
import cube.engine.archive.ArchiveManager;
import cube.engine.sharing.SharingManager;

public class ServerListener implements ServletContextListener {

	public ServerListener() {
	}

	@Override
	public void contextInitialized(ServletContextEvent event) {
		LogManager.getInstance().addHandle(LogManager.createSystemOutHandle());

		// 创建分配池
		CubeAccountPool.create();

		if (null == Nucleus.getInstance()) {
			NucleusConfig config = new NucleusConfig();
			config.role = NucleusConfig.Role.CONSUMER;
			config.device = NucleusConfig.Device.DESKTOP;
			config.talk.block = 16384;
			try {
				Nucleus nucleus = Nucleus.createInstance(config);
				if (nucleus.startup()) {
					Logger.i(this.getClass(), "Nucleus startup");
				}
			} catch (SingletonException e) {
				e.printStackTrace();
			}
		}

		Config config = loadConfig(event.getServletContext().getRealPath("/"));

		// 数据库配置
		ConnectionFactory.getInstance().setConfig(config.dbUsername, config.dbPassword, config.dbHost);

		// 启动文件管理器
		FileManager.getInstance().activate(config.fileUploadStorePath, config.fileUploadTempPath
				, config.fileUploadWorkPath, config.fileUpUrlPrefix, config.fileUploadSizeThreshold, config.fileUploadFileSizeMax);

		SharingManager.getInstance().init(config.fileUploadStorePath, config.fileUploadTempPath
				, config.fileUploadWorkPath, config.fileUpUrlPrefix, config.fileUploadSizeThreshold, config.fileUploadFileSizeMax);

		ArchiveManager.getInstance().init(config.fileUploadStorePath, config.fileUploadTempPath
				, config.fileUploadWorkPath);

		// 启动主服务器连接管理代理
		DispatcherAgent.getInstance().start(config.dispatcherHost, config.dispatcherPort, config.dispatcherMaster, config.dispatcherToken);

		// 启动文件转换工具
		ConvertTool.getInstance().start(config.convertToolHost, config.convertToolPort);
		ConvertTool.getInstance().setListener(FileManager.getInstance());
		ConvertTool.getInstance().setListener(SharingManager.getInstance());
	}

	@Override
	public void contextDestroyed(ServletContextEvent event) {
		// 关闭主服务器连接管理代理
		DispatcherAgent.getInstance().stop();

		// 关闭文件管理器
		FileManager.getInstance().deactivate();
		
		// 关闭文件转换服务
		ConvertTool.getInstance().stop();

		// 关闭归档管理器
		ArchiveManager.getInstance().dispose();

		if (null != Nucleus.getInstance()) {
			Nucleus.getInstance().shutdown();
		}

		// 销毁分配池
		CubeAccountPool.destroy();

		ChannelFactory.getInstance().stop();
	}

	private Config loadConfig(String path) {
		Config config = new Config();
		String filePath = path + "WEB-INF/config.properties";
		try {
			InputStream is = new FileInputStream(filePath);
			Properties prop = new Properties();
			prop.load(is);

			config.dbUsername = prop.getProperty("db.username");
			config.dbPassword = prop.getProperty("db.password");
			config.dbHost = prop.getProperty("db.host");

			// 上传文件的管理目录
			config.fileUploadTempPath = prop.getProperty("file_upload.temp_path");
			config.fileUploadStorePath = prop.getProperty("file_upload.store_path");
			config.fileUploadWorkPath = prop.getProperty("file_upload.work_path");
			config.fileUpUrlPrefix = prop.getProperty("file_upload.url_prefix");
			config.fileUploadSizeThreshold = Integer.parseInt(prop.getProperty("file_upload.size_threshold"));
			config.fileUploadFileSizeMax = Long.parseLong(prop.getProperty("file_upload.file_size_max"));

			config.dispatcherHost = prop.getProperty("dispatcher.host");
			config.dispatcherPort = Integer.parseInt(prop.getProperty("dispatcher.port"));
			config.dispatcherMaster = prop.getProperty("dispatcher.master");
			config.dispatcherToken = prop.getProperty("dispatcher.token");

			config.convertToolHost = prop.getProperty("converttool.host");
			config.convertToolPort = Integer.parseInt(prop.getProperty("converttool.port"));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return config;
	}

	private class Config {
		protected String dbUsername;
		protected String dbPassword;
		protected String dbHost;

		protected String fileUploadTempPath;
		protected String fileUploadStorePath;
		protected String fileUploadWorkPath;
		protected String fileUpUrlPrefix;
		protected int fileUploadSizeThreshold;
		protected long fileUploadFileSizeMax;

		protected String dispatcherHost;
		protected int dispatcherPort;
		protected String dispatcherMaster;
		protected String dispatcherToken;

		protected String convertToolHost;
		protected int convertToolPort;
	}
}
