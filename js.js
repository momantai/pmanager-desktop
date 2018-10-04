const uuid = require('uuid')
const Vue = require('vue/dist/vue')
const socket = require('socket.io-client')('http://127.0.0.1:5000/view')

//const socket = io.connect('http://127.0.0.1:5000/view');
socket.on('message', (msg)=> {
    if(msg.ty == 'change'){
        tb.change(msg);
    } else{
        tb.newItem(msg);
    }
})

let tb = new Vue({
    el: '.tboard',
    data: {
        titulo: 'Hola.',
        status: ['backlog', 'progress', 'review', 'stop'],
        task: [
            {
                id: 0,
                sta: 'backlog',
                title: 'Hola.',
                progress: null,
                comment: null,
                play: false
            },
            {
                id: 1,
                sta: 'backlog',
                title: 'Hola.',
                progress: null,
                comment: [],
                play: false
            },
            {
                id: 2,
                sta: 'backlog',
                title: 'Programar barra latereal de opciones',
                progress: 8 / 10,
                comment: null,
                play: false
            },
            {
                id: 3,
                sta: 'progress',
                title: 'Investigación de mercado.',
                progress: 8 / 10,
                comment: null,
                play: false
            },
            {
                id: 4,
                sta: 'progress',
                title: 'Definición y detallado de las actividades a realizar primeramente y actividades futuras.',
                progress: 8 / 10,
                comment: null,
                play: false
            },
            {
                id: 5,
                sta: 'review',
                title: 'Reunión de equipo.',
                progress: 8 / 10,
                comment: null,
                play: false
            },
            {
                id: 6,
                sta: 'stop',
                title: 'Reunión de equipo.',
                progress: 8 / 10,
                comment: null,
                play: false
            }
        ],
        titem: "",
        sitem: "backlog"
    },
    computed: {
        taskboard() {
            let boards = []
            let temp = null

            for (var i = 0; i < this.status.length; i++) {
                temp = this.task.filter(task => task.sta.indexOf(this.status[i]) === 0)
                
                boards.push(temp)
            }
            delete temp
            return boards
        }
    },
    methods: {
        play: function (i, s) {
            for (j = 0; j < this.task.length; j++) {
                if (this.task[j].id == i && this.task[j].sta == s) {
                    this.task[j].sta = 'progress'
                    this.task[j].play = true
                    break
                }
            }
        },
        pause: function (i, s) {
            for (j = 0; j < this.task.length; j++) {
                if (this.task[j].id == i && this.task[j].sta == s) {
                    this.task[j].sta = 'backlog'
                    this.task[j].play = false
                    break
                }
            }
        },
        indexPos: function (v) {
            for (j = 0; j < this.status.length; j++) {
                if (v == this.status[j]) {
                    return j
                }
            }
        },
        change: function (rmch){
            if (rmch.m == '') {
                socket.emit('message', {ty: 'change', i: rmch.i, s: rmch.s, t: rmch.t, m: 'rm' });
            } else {
                ind = this.indexPos(rmch.s)
                if (ind != (this.status.length)) {
                    for (j = 0; j <= this.task.length; j++) {
                        if (this.task[j].id == rmch.i && this.status[ind] == rmch.s) {
                            if (rmch.t == 'n') {
                                this.task[j].sta = this.status[ind + 1]
                            } else {
                                this.task[j].sta = this.status[ind - 1]
                            }
                            break
                        }
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
        newItemE: function (edo) {
            this.sitem = edo;
            this.oculteEl('Modal', 'hidden');
        },
        newItem: function (rmni) {
            if (rmni.m == '') {
                socket.emit('message', { ty: 'create', i: uuid.v1(), s: this.sitem, t: this.titem, m: 'rm' });
                this.titem = "";
                this.sitem = "";
            } else {
                if (rmni.t != "") {
                    this.task.push({
                        id: rmni.i,
                        sta: rmni.s,
                        title: rmni.t,
                        // progress: null,
                        // comment: null,
                        // play: false
                    });
                }
            }
        }

    }
})