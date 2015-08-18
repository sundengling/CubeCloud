package cube.cloud.core;

import java.util.Vector;

public class CubeAccountPool {

	private static final CubeAccountPool instance = new CubeAccountPool();

	public static final int CA_BEGIN = 11000;
	public static final int CA_END = 20000;
	public static final int CG_BEGIN = 1000;
	public static final int CG_END = 2000;

	private Vector<String> accountList;
	private Vector<String> groupList;

	private CubeAccountPool() {
		this.accountList = new Vector<String>();
		this.groupList = new Vector<String>();
	}

	protected void init() {
		for (int i = CA_BEGIN; i < CA_END; ++i) {
			this.accountList.add(String.valueOf(i));
		}

		for (int i = CG_BEGIN; i < CG_END; ++i) {
			this.groupList.add(String.valueOf(i));
		}
	}

	protected void dispose() {
		this.accountList.clear();
		this.groupList.clear();
	}

	protected String borrowAccount() {
		return this.accountList.remove(0);
	}

	protected void returnAccount(String account) {
		this.accountList.add(account);
	}

	protected String borrowGroup() {
		return this.groupList.remove(0);
	}

	protected void returnGroup(String group) {
		this.groupList.add(group);
	}

	public static void create() {
		CubeAccountPool.instance.init();
	}

	public static void destroy() {
		CubeAccountPool.instance.dispose();
	}

	public static String allocAccount() {
		return CubeAccountPool.instance.borrowAccount();
	}
	public static void freeAccount(String account) {
		CubeAccountPool.instance.returnAccount(account);
	}

	public static String allocGroup() {
		return CubeAccountPool.instance.borrowGroup();
	}
	public static void freeGroup(String group) {
		CubeAccountPool.instance.returnGroup(group);
	}
}
