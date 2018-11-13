//let url = 'https://pmanagerd.mybluemix.net'
let url = 'http://0.0.0.0:5000'
const uuid = require('uuid')
const Vue = require('vue/dist/vue')
const socket = require('socket.io-client')(url + '/view')
const axios = require('axios')
qstring = require('querystring')
//const socket = io.connect('http://127.0.0.1:5000/view');

let self = this;
let urltask = url + '/api/momantai/plam/task'

socket.on('message', (msg)=> {
    console.log("Se ha recibido un mensaje.")
    console.log(msg)
    if(msg.typeAction == 'changeStatus'){
        tb.changeStatus(msg);
    } else if(msg.typeAction == 'deleteTask'){
        tb.deleteTask(msg)
    } else if(msg.typeAction == 'taskEdit') {
        tb.taskEdit(msg)
    } else {
        tb.newTask(msg);
    }
})




axios.get(urltask)
    .then(response => (tb.task = response.data.task))

let tb = new Vue({
    el: '.tboard',
    data: {
        titulo: 'Hola.',
        status: ['Backlog', 'Progress', 'Review', 'Stop'],
        task: [],
        temptask: [],
        titleItem: "",
        statustem: "backlog",
        tagsItem: '',
        options: {
            'titleEdit': false
        }
    },
    computed: {
        taskboard() {
            let boards = []
            let temp = null
            if(this.temptask.length == 0){
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
            return boards
        }
    },
    methods: {
        indexPosition: function (v) {
            for (j = 0; j < this.status.length; j++) {
                if (v == this.status[j]) {
                    return j
                }
            }
        },
        filterTag: function(tag) {
            let temp = []

            for (var i = 0, l = this.task.length; i < l; i++) {
                if(this.task[i].hasOwnProperty('tag') && this.task[i].tag.includes(tag.t)){
                    temp.push(this.task[i])
                }
            }
            this.temptask = temp
            delete temp
        }
        ,
        newTask: function (nTask) { /* Función para crear nueva tarea. */
            if (nTask.m == '' && this.titleItem != '') {
                axios.post(urltask, qstring.stringify({
                    'work': this.titleItem,
                    'status': this.statustem,
                    'typeAction': 'create',
                    'tags': this.tagsItem,
                    'm': 'mr'
                }));

                this.titleItem = "";
                this.statustem = "";
            } else {
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
                for (j = 0; j <= this.task.length; j++) {
                    if (this.task[j]._id == tEdit._id) {
                        this.task[j].work = tEdit.work
                        break
                    }
                }
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
                for (j = 0; j <= this.task.length; j++) {
                    if (this.task[j]._id == changeS._id) {
                        this.task[j].status = changeS.status
                        break
                    }
                }
            }
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
                // Falta arreglar esta parte, elimina todo en pantalla :'v
                for (var j = 0; j < this.task.length; j++) {
                    if (this.task[j]._id == dTask.id) {
                        this.task.splice(j, 1)
                        break
                    }
                }
            }
        },
        oculteEl: function (idE, classE) {
            if (document.getElementById("Modal").classList.contains("hidden")) {
                document.getElementById("Modal").classList.remove("hidden");
                document.getElementById("inputNItem").focus();
            } else {
                document.getElementById("Modal").classList.add("hidden");
            }
        },
        newItemE: function (statusN) {
            this.statustem = statusN;
            this.oculteEl('Modal', 'hidden');
        }


    }
})
