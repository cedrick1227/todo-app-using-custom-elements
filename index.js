Object.prototype.tools = function(){
	return {
		map:(fn)=>{
			let entries = Object.entries(this);
			for (let [key, value] of entries){
				fn(key, value);
			}
		},
		reduce: (fn, initial)=>{
			let entries = Object.entries(this);
			for (let [key, value] of entries){
				fn(key, value, initial);
			}
			return initial;
		},
	}
}
HTMLElement.prototype.storage = function(){
	let name = 'xstate';
	return {
		get:(id)=>{
			if (!id){
				return this.storage()._open();
			}
			let store = this.storage()._open();
			let has = store.some(item=>{
				return item.id == id;
			})
			if (has){
				return store.find(item=>{
					return item.id == id;
				})
			} else {
				return false;
			}
		},
		set:(obj)=>{
			let store = this.storage()._open().map(item=>{
				if (item.id == obj.id){
					item = obj;
				}
				return item;
			})
			let has = store.some(item=>{
				return item.id == obj.id;
			})
			if (!has){
				store.unshift(obj);
			}
			this.storage()._close(store);
		},
		trash:(id)=>{
			let store = this.storage()._open().filter(item=>{
				return item.id != id;
			});
			this.storage()._close(store);
		},
		_open:()=>{
			let store = this.getAttribute(name);
			if (!store){
				this.setAttribute(name, JSON.stringify(new Array));
				store = this.getAttribute(name);
			}
			return JSON.parse(store);
		},
		_close:(obj)=>{
			this.setAttribute(name, JSON.stringify(obj));
		}
	}
}

class TableContainer extends HTMLElement{
	constructor(){
		super();
	}
	static get observedAttributes(){
		return ['xstate']
	}
	attributeChangedCallback(name, oldVal, newVal ){
		if (name == 'xstate'){
			let store = this.storage().get();
			if (!store.length){
				return;
			}
			let tbody = this.querySelector('tbody');
			let thead = this.querySelector('thead');
			thead.innerHTML = `
				<tr>
					<th>tasks</th>
				</tr>
			`
			
			tbody.innerHTML = store.map(item=>{
					return `
						<tr id=${item.id}>
							${
								item.tools().reduce((key, value, accu)=>{
									let template =  `
										<td>${value}</td>
									`
									if (key != 'id'){
										accu.push(template);
									}
									
									return accu;
								}, []).join("")
							}
						</tr>
					`
				}).join("");
			

		}
	}
	connectedCallback(){
		this.innerHTML = `
			<table>
				<thead></thead>
				<tbody></tbody>
			</table>
		`;
	}
}
window.customElements.define('table-container', TableContainer)


let form = `
	<form method='post'>
		<input name='input' placeholder='New To Do' type='text'>
		<button type='submit'>Submit</button>
	</form>
`
let tableContainer = document.createElement('table-container');
let formContainer = document.createElement('div');
formContainer.innerHTML = form;

let container = `
	<div class='container'>
		<h1>To Do.</h1>
	</div>
`
let temp = document.createElement('div');
temp.innerHTML = container;
container = temp.children[0];


container.appendChild(formContainer);
container.appendChild(tableContainer);
document.body.appendChild(container);

document.forms[0].addEventListener('submit', (e)=>{
	e.preventDefault();
	let task = document.forms[0].elements.input.value;
	let id = new Date().getTime();
	let obj = {id, task};
	tableContainer.storage().set(obj);
})