package cube.engine.archive;

import java.io.File;

import org.json.JSONObject;

public interface ArchiveListener {

	public void onSaved(JSONObject param, File videoFile, File audioFile);

	public void onArchiving(JSONObject param, String fileName);

	public void onArchiveCompleted(JSONObject param, File file);
}
