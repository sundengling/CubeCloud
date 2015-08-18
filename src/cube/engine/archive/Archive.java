package cube.engine.archive;

import java.io.File;
import java.util.Calendar;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 归档。
 */
public class Archive implements Comparable<Archive> {

	private String account;
	private File file;

	private String prefix;
	private long timestamp;
	private int durationInSeconds;

	public Archive(String account, File file) {
		this.account = account;
		this.file = file;

		this.parseFileName(file.getName());
	}

	public String getAccount() {
		return this.account;
	}

	public String getPrefix() {
		return this.prefix;
	}

	public File getFile() {
		return this.file;
	}

	public String getFileName() {
		return this.file.getName();
	}

	public long getTimestamp() {
		return this.timestamp;
	}

	public boolean correct() {
		return (null != this.prefix);
	}

	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		try {
			json.put("name", this.account);
			json.put("prefix", this.prefix);
			json.put("timestamp", this.timestamp);
			json.put("duration", this.durationInSeconds);
			json.put("file", this.file.getName());
			json.put("size", this.file.length());
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return json;
	}

	private void parseFileName(String filename) {
		String[] tmp = filename.split("_");

		if (tmp.length < 3) {
			return;
		}

		String prefix = tmp[0];
		String time = tmp[1];
		String duration = tmp[2];
		int index = duration.indexOf(".");
		if (index > 0) {
			duration = duration.substring(0, index);
		}

		this.prefix = prefix.toString();

		Calendar c = Calendar.getInstance();
		c.set(Integer.parseInt(time.substring(0, 4)),
				Integer.parseInt(time.substring(4, 6)) - 1,
				Integer.parseInt(time.substring(6, 8)),
				Integer.parseInt(time.substring(8, 10)),
				Integer.parseInt(time.substring(10, 12)),
				Integer.parseInt(time.substring(12, 14)));
		this.timestamp = c.getTimeInMillis();

		this.durationInSeconds = Integer.parseInt(duration);
	}

	@Override
	public int compareTo(Archive other) {
		return (int)(this.timestamp - other.timestamp);
	}
}
