package cube.cloud;

import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.atomic.AtomicBoolean;

public class Test {

	public Test() {
		// TODO Auto-generated constructor stub
	}

	private static boolean spinning = true;
	private static AtomicBoolean aFinish = new AtomicBoolean(false);

	public static boolean isSpinning() {
		return spinning;
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {

		final Object mutex = new Object();
		final Queue<String> queue = new LinkedList<String>();

		Thread a = new Thread() {
			@Override
			public void run() {
				aFinish.set(false);

				for (int i = 0; i < 100; ++i) {
					synchronized (mutex) {
						queue.offer("data:" + i);
						System.out.println("offer: " + i);

						mutex.notifyAll();
					}
				}

				aFinish.set(true);
			}
		};

		Thread b = new Thread() {
			@Override
			public void run() {
				while (isSpinning()) {
					if (aFinish.get()) {
						synchronized (mutex) {
							if (queue.isEmpty()) {
								spinning = false;

								mutex.notifyAll();
							}
						}
					}

					synchronized (mutex) {
						if (queue.isEmpty() && !aFinish.get()) {
							try {
								mutex.wait();
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
						}

						if (!queue.isEmpty()) {
							String data = queue.poll();
							System.out.println("=== b: " + data);
						}
					}
				}

				System.out.println("=== b quit");
			}
		};

		Thread c = new Thread() {
			@Override
			public void run() {
				while (isSpinning()) {
					if (aFinish.get()) {
						synchronized (mutex) {
							if (queue.isEmpty()) {
								spinning = false;

								mutex.notifyAll();
							}
						}
					}

					synchronized (mutex) {
						if (queue.isEmpty() && !aFinish.get()) {
							try {
								mutex.wait();
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
						}

						if (!queue.isEmpty()) {
							String data = queue.poll();
							System.out.println("*** c: " + data);
						}
					}
				}

				System.out.println("*** c quit");
			}
		};

		b.start();
		c.start();

		// try {
		// Thread.sleep(100);
		// } catch (InterruptedException e1) {
		// e1.printStackTrace();
		// }

		a.start();

		try {
			Thread.sleep(5000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	protected static String stringToMD5(String string) {
		try {
			byte[] hash = MessageDigest.getInstance("MD5").digest(
					string.getBytes(Charset.forName("UTF-8")));
			StringBuilder hex = new StringBuilder(hash.length * 2);
			for (byte b : hash) {
				if ((b & 0xFF) < 0x10)
					hex.append("0");
				hex.append(Integer.toHexString(b & 0xFF));
			}
			return hex.toString();
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}

		return null;
	}
}
