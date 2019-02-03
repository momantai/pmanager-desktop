module.exports = function () {
	var self = this;

	(function () {
		//let url = 'https://pmanagerd.mybluemix.net'
		let url = 'http://0.0.0.0:5000'
		const Vue = require('vue/dist/vue')
		const socket = require('socket.io-client')(url + '/view')
		const axios = require('axios')
		qstring = require('querystring')

		const InputTag = require('vue-input-tag')
		const vuedrag = require('vuedraggable')


		fetch = require('node-fetch')

		const fdata = require('form-data')

		//const socket = io.connect('http://127.0.0.1:5000/view');

		let self = this;
		//let urltask = url + '/api/momantai/plam/task'
		let urltask = url + '/api/'+ownerG+'/'+projectG+'/task'

		socket.on('message', (msg) => {
			console.log("Se ha recibido un mensaje.")
			console.log(msg)
			if (msg.typeAction == 'changeStatus') {
				tb.changeStatus(msg)
			} else if (msg.typeAction == 'deleteTask') {
				tb.deleteTask(msg)
			} else if (msg.typeAction == 'title') {
				tb.taskEdit(msg)
			} else {
				tb.newTask(msg)
			}
		})

		axios.get(urltask)
			.then(response => (tb.task = response.data.task))

		Vue.component('input-tag', InputTag.default)
		Vue.component('draggable', vuedrag)

		let tb = new Vue({
			el: '#main',
			data: {
				titulo: 'Hola.',
				status: ['Backlog', 'Progress', 'Review', 'Stop'],
				statusEsp: { // Estados en idioma español.
					'Backlog': 'Almacen',
					'Progress': 'En progreso',
					'Review': 'En revisión',
					'Stop': 'Finalizado'
				},
				task: [],
				temptask: [],
				index: {},
				titleItem: "",
				statustem: "backlog",
				tagsItem: [],
				taskInfo: [],
				tagOpt: '',
				opt: {
					'titleEdit': false,
					'descriptionEdit': false
				},
				file: '',
				_idtofile: '',
				url: url,
				todos: [],
				todo: '',
				todotempid: '',
				todobolean: false,
				elmove: ""
			},
			computed: {
				taskboard() { // Crear listas de acuerdo a los status existentes de las tareas.
					let boards = []
					let temp = null
					if (this.temptask.length == 0) {
						for (var i = 0, l = this.status.length; i < l; i++) {
							temp = this.task.filter(task => task.status.indexOf(this.status[i]) === 0)

							boards.push(temp)
						}
					} else {
						for (var i = 0, l = this.status.length; i < l; i++) {
							temp = this.temptask.filter(task => task.status.indexOf(this.status[i]) === 0)

							boards.push(temp)
						}
					}

					delete temp
					this.indexed
					return boards
				},
				indexed() {
					index = {}
					for (i = 0, j = this.task.length; i < j; i++) {
						index[this.task[i]._id] = i
					}
					this.index = index
				}
			},
			methods: { // indexPosition para saber el indice de un estado.
				onMove: function(evt, originalEvent) {
					this.elmove = evt.draggedContext.element._id
				},
				onStart: function(evt){
					console.log(evt.from.id)
				},
				End: function(evt){
					console.log(evt.to.id)
					console.log(this.onMove)
					this.changeStatus({'m': 'rm', 'status': this.status[parseInt(evt.to.id)], '_id': this.elmove})
					socket.emit('message', {m: 'rm', typeAction: 'changeStatus', _id: this.elmove, status: this.status[parseInt(evt.to.id)]})
				},
				indexPosition: function (v) {
					for (j = 0; j < this.status.length; j++) {
						if (v == this.status[j]) {
							return j
						}
					}
				},
				filterTag: function (tag) { // Para filtrar por etiquetas.
					let temp = []
					this.tagOpt = tag
					for (var i = 0, l = this.task.length; i < l; i++) {
						if (this.task[i].hasOwnProperty('tag') && this.task[i].tag.includes(tag.t)) {
							temp.push(this.task[i])
						}
					}
					this.temptask = temp
					delete temp
				}
				,
				newTask: function (nTask) { /* Función para crear nueva tarea. */
					if (nTask.m == '' && this.titleItem.trim() != '') {
						axios.post(urltask, qstring.stringify({
							'work': this.titleItem,
							'status': this.statustem,
							'typeAction': 'create',
							'tags': String(this.tagsItem),
							'm': 'mr'
						}));

						this.titleItem = "";
						this.statustem = "";
						this.tagsItem = [];
					} else if (nTask._id != "" && nTask.m != "") {
						if (nTask.work != "") {
							this.task.push({
								_id: nTask._id,
								status: nTask.status,
								work: nTask.work,
								tag: nTask.tag
							});
						}
					}
				},
				taskEdit: function (tEdit) { /* Función para editar una tarea existente. */
					if (tEdit.m == '') {
						axios.put(urltask, qstring.stringify({
							typeAction: 'taskEdit',
							_id: tEdit.i,
							work: tEdit.work,
							m: 'rm'
						}))
					} else {
						this.task[this.index[tEdit._id]].work = tEdit.work
					}
				},
				changeStatus: function (changeS) { /* F. para cambiar el estado de una tarea. */
					if (changeS.m == '') {
						axios.put(urltask, qstring.stringify({
							typeAction: 'changeStatus',
							_id: changeS.i,
							status: changeS.s,
							move: changeS.t,
							m: 'rm'
						}))
					} else {
						this.task[this.index[changeS._id]].status = changeS.status
					}
				},
				changeTitle: function () { // Cambiar titulo por uno nuevo.
					d = document.getElementById('textTitle')
					this.opt.titleEdit = false
					axios.put(url + '/api/'+ownerG+'/'+projectG+'/t/' + this.taskInfo._id, qstring.stringify({
						newTitle: this.taskInfo.work,
						action: 'title'
					}))

					this.task[this.index[this.taskInfo._id]].work = this.taskInfo.work
				},
				changeDescription: function () { // Agregar o actualizar descripción de una tarea.
					d = document.getElementById('textDescription')
					this.opt.descriptionEdit = false
					this.taskInfo.description = d.innerHTML
					axios.put(url + '/api/'+ownerG+'/'+projectG+'/t/' + this.taskInfo._id, qstring.stringify({
						newDescription: this.taskInfo.description,
						action: 'description'
					}))
				},
				deleteTask: function (dTask) { /* Función para eliminar una tarea. */
					if (dTask.m == '') {
						axios.delete(urltask,
							{
								params: {
									'typeAction': 'deleteTask',
									'id': dTask.i,
									'm': 'rm'
								}
							})
					} else {
						this.task.splice(this.index[dTask.id], 1)
					}
				},
				oculteEl: function (idE, classE) {
					if (document.getElementById("Modal").classList.contains("hidden")) {
						document.getElementById("Modal").classList.remove("hidden");
						document.getElementById("inputNItem").focus();
					} else {
						this.$children[0]._data.innerTags = []
						document.getElementById("Modal").classList.add("hidden");
					}
				},
				newItemE: function (statusN) {
					this.statustem = statusN;
					this.oculteEl('Modal', 'hidden')
				},
				taskInformation: function (_id = "") {
					tI = document.getElementById('modal_task')
					tI.classList.toggle('hidden')

					this._idtofile = _id

					if (_id != "") {
						axios.get(url + '/api/'+ownerG+'/'+projectG+'/t/' + _id)
							.then(response => (tb.taskInfo = response.data.task[0]))
					}
				},
				nfile: function (event) { // Subir recurso a servidor.
					console.log(event.target.files[0])
					var form = new FormData()
					form.append('file', event.target.files[0])
					form.append('namefile', event.target.files[0].name)
					axios.post(url + '/'+ownerG+'/'+projectG+'/upFile/' + this._idtofile, form)
						.then(res => {
							if (!this.taskInfo.hasOwnProperty('resources')) {
								console.log('Entro!')
								this.taskInfo.resources = [{}]
							}
							console.log(res.data)
							this.taskInfo.resources.push(res.data)
						})

				},
				bfileset: function () { // ByPass del input file.
					this.$refs.bfiles.click()
				},
				notifi: function () {
					console.log('click a barra')
					let myNotifi = new Notification('Plam', {
						body: 'Esta es una nueva, notificación.'
					})
					myNotifi.onclick = () => {
						console.log('Dio un click')
					}
				},
				// Area de Todo (Checklist) CRUD
				addTodo: function () {

					axios.put(url + '/api/'+ownerG+'/'+projectG+'/t/' + this.taskInfo._id, qstring.stringify({
						action: 'todo',
						actodo: 'create',
						todo: this.todo
					})).then(res => {
						this.taskInfo.todo.push(res.data)
						console.log(res.data)
					})

					this.todo = ''


				},
				deleteTodo: function (id) {
					axios.put(url + '/api/'+ownerG+'/'+projectG+'/t/' + this.taskInfo._id, qstring.stringify({
						action: 'todo',
						actodo: 'delete',
						_id: this.taskInfo.todo[id]._id,
					}))
					this.taskInfo.todo.splice(id, 1)
				},
				editTodo: function (id) {
					//this.todo = this.taskInfo.todo[id].todo
					//this.deleteTodo(id)
					if (this.todobolean) {
						axios.put(url + '/api/'+ownerG+'/'+projectG+'/t/' + this.taskInfo._id, qstring.stringify({
							action: 'todo',
							actodo: 'update',
							_id: this.taskInfo.todo[this.todotempid]._id,
							todo: this.todo,
							check: this.taskInfo.todo[this.todotempid].check
						}))

						this.todobolean = false
						this.taskInfo.todo[this.todotempid].todo = this.todo
						this.todo = ''
						this.todotempid = ''
					} else {
						this.todobolean = true
						this.todo = this.taskInfo.todo[id].todo
						this.todotempid = id
					}
				},
				checkTodo: function (id) {
					if (this.taskInfo.todo[id].check == '') {
						axios.put(url + '/api/'+ownerG+'/'+projectG+'/t/' + this.taskInfo._id, qstring.stringify({
							action: 'todo',
							actodo: 'update',
							_id: this.taskInfo.todo[id]._id,
							todo: this.taskInfo.todo[id].todo,
							check: 'check'
						}))
						console.log(this.taskInfo.todo[id]._id)
						this.taskInfo.todo[id].check = 'check'
					} else {
						axios.put(url + '/api/'+ownerG+'/'+projectG+'/t/' + this.taskInfo._id, qstring.stringify({
							action: 'todo',
							actodo: 'update',
							'_id': this.taskInfo.todo[id]._id,
							'todo': this.taskInfo.todo[id].todo,
							'check': ''
						}))
						console.log(this.taskInfo.todo[id]._id)
					}
				},


				// DRAG AND DROP

				onEnd: function(evt){
				},
				checkMove: function(evt,originalEvent){
				  console.log('draggedContext', evt.draggedContext);
				  console.log('relatedContext', evt.relatedContext);
				  // I can not drag with an apple
				  return (evt.draggedContext.element.name!=='Apple');
				},
				insertItem: function(){
				  var self = this;
				  var newNo = 1;
				  
				  if(self.items.concat().length > 0)
					newNo =  Math.max.apply(null, self.items.concat().map(function(item){return item.no;})) +1;
				  
				  this.items.push(
					{
					  no:　newNo,
					  name:'banana'+newNo,
					  categoryNo:'3'
					}
					);
				  self.count =  self.count+1;
				},
				deleteItem: function(item, index){
				  this.items.splice(index, 1);
				},
			}
		})

	})();
};
