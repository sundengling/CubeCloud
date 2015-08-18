package cube.cloud.util;

public class FileUtils {

	private FileUtils() {
	}

	/**
	 * 提取文件后缀名。
	 * @param fileName
	 * @return
	 */
	public static String extractFileExtension(String fileName) {
		int lastIndex = fileName.lastIndexOf(".");
		if (lastIndex < 0) {
			return null;
		}

		return fileName.substring(lastIndex + 1, fileName.length());
	}

	/**
	 * 提取文件名。
	 * @param fileName
	 * @return
	 */
	public static String extractFileName(String fileName) {
		int lastIndex = fileName.lastIndexOf(".");
		if (lastIndex < 0) {
			return null;
		}

		return fileName.substring(0, lastIndex);
	}
}
