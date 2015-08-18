package cube.cloud.auth;

import java.util.LinkedList;
import java.util.List;
import java.util.Vector;

/**
 * 
 */
public class Role {

	private List<Listener> listeners;
	private List<Authority> list;

	public Role() {
		this.listeners = new Vector<Listener>();
		this.list = new Vector<Authority>();
	}

	public void addListener(Listener listener) {
		
		//添加监听者
		if (this.listeners.contains(listener)) {
			return;
		}

		this.listeners.add(listener);
	}

	public void removeListener(Listener listener) {
		
		//移除监听者
		this.listeners.remove(listener);
	}

	public boolean addAuthority(Authority auth) {
		Authority prefix = Authority.parse(auth.getPrefix());
		if (prefix != Authority.None) {
			if (!this.list.contains(prefix)) {
				return false;
			}
		}
		//通知监听者
		if (!this.list.contains(auth)) {
			this.list.add(auth);

			for (Listener l : this.listeners) {
				l.onAdded(auth);
			}
		}

		return true;
	}

	//通知监听者
	//fix me
	public void removeAuthority(Authority auth) {
		
	
		
		if (this.list.remove(auth)) {
			for (Listener l : this.listeners) {
				l.onRemoved(auth);
			}
			return;
		}

		for (Authority a : this.list) {
			if (a.getPrefix() == auth.getCode()) {
				this.removeAuthority(a);
				break;
			}
		}
		
	
	}

 	public boolean hasAuthority(Authority auth) {
		return this.list.contains(auth);
	}

	public List<Authority> getAuthorityList() {
		LinkedList<Authority> ret = new LinkedList<Authority>();
		ret.addAll(this.list);
		return ret;
	}

	public interface Listener {
		public void onAdded(Authority auth);
		public void onRemoved(Authority auth);
	}
}