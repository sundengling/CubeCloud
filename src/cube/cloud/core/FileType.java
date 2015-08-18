package cube.cloud.core;

public enum FileType {

	JPG("jpg"),
	PNG("png"),
	BMP("bmp"),
	JPEG("jpeg"),
	GIF("gif"),

	PDF("pdf"),
	DOC("doc"),
	DOCX("docx"),
	PPT("ppt"),
	PPTX("pptx"),

	MP4("mp4"),
	OGG("ogg"),
	MP3("mp3"),
	WAV("wav"),

	UNKNOWN("");

	private String extension;

	FileType(String extension) {
		this.extension = extension;
	}

	public String getExtension() {
		return this.extension;
	}

	public static FileType parseType(String extension) {
		for (FileType t : FileType.values()) {
			if (t.extension.equals(extension)) {
				return t;
			}
		}

		return FileType.UNKNOWN;
	}
}
