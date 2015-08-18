package cube.cloud.core;

import java.util.concurrent.atomic.AtomicInteger;

import net.cellcloud.util.Utils;

public class Guest extends Tenant {

	private static final AtomicInteger GuestSnCursor = new AtomicInteger(0);

	public Guest(String name) {
		super(name, Utils.randomString(32));
		this.guest = true;
	}

	public static boolean guessGuestName(String name) {
		if (name.startsWith("guest") && name.indexOf("@cube.cn") > 0) {
			return true;
		}
		else {
			return false;
		}
	}

	public static Guest createRandomGuest() {
		int cursor = GuestSnCursor.incrementAndGet();
		Guest guest = new Guest("guest" + cursor + "@cube.cn");
		guest.setDisplayName("访客 " + cursor);

		if (cursor >= 9999) {
			GuestSnCursor.set(0);
		}

		// 将访客放入缓存
		TenantCache.getInstance().put(guest);

		return guest;
	}
}
