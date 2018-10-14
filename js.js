const uuid = require('uuid')
const Vue = require('vue/dist/vue')
const socket = require('socket.io-client')('http://127.0.0.1:5000/view')
const axios = require('axios')
qstring = require('querystring')
//const socket = io.connect('http://127.0.0.1:5000/view');

socket.on('message', (msg)=> {
    if(msg.typeAction == 'changeStatus'){
        tb.change(msg);
    } else if(msg.typeAction == 'deleteTask'){

    } else {
        tb.newItem(msg);
    }
})

let urltask = 'http://127.0.0.1:5000/api/momantai/plam/task'

axios.get(urltask)
    .then(response => (tb.task = response.data.task))

let tb = new Vue({
    el: '.tboard',
    data: {
        titulo: 'Hola.',
        status: ['backlog', 'progress', 'review', 'stop'],
        task: [],
        titleItem: "",
        statustem: "backlog"
    },
    computed: {
        taskboard() {
            let boards = []
            let temp = null

            for (var i = 0; i < this.status.length; i++) {
                temp = this.task.filter(task => task.status.indexOf(this.status[i]) === 0)
                
                boards.push(temp)
            }
            delete temp
            return boards
        }
    },
    methods: {
        indexPos: function (v) {
            for (j = 0; j < this.status.length; j++) {
                if (v == this.status[j]) {
                    return j
                }
            }
        },
        change: function (changeS) {
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
        deleteTask: function (idD) {
            axios.delete(urltask,
                {
                    params: {
                        'typeAction': 'deleteTask',
                        'id': idD,
                        'm': 'rm'
                    }
                })
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
        },
        newItem: function (nTask) {
            if (nTask.m == '' && this.titleItem != '') { 
                axios.post(urltask, qstring.stringify({
                    '_id': uuid.v4(),
                    'work': this.titleItem,
                    'status': this.statustem,
                    'typeAction': 'create',
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
                    });
                }
            }
        }

    }
})