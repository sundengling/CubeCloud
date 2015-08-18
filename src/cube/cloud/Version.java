package cube.cloud;

public final class Version {

	public static final int Major = 1;

	public static final int Minor = 1;

	public static final int Revision = 7;

	public static final String State = "Beta";

	public static final String Update = "20150529";

	private Version() {
	}

	public static String getDescription() {
		return Major + "." + Minor + "." + Revision + " " + State + " " + Update;
	}
}
