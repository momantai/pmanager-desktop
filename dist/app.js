axios.get(url + '/api/projects/momantai')
    .then((response) => {
        vp.dataps = response.data
        console.log(response.data)
        vp.loading = false
    })
    .catch((error) => {
        console.log('Erroooooooor!')
    })
console.log('Obteniendo datos.')

let vp = new Vue({
    el: '#pviews',
    data: {
        dataps: [],
        datap: {},
        datapcache: {
            title: '',
            details: ''
        },
        idpm: 'Hola',
        loading: true,
        editprojectopt: {
            name: true,
            details: true,
            collaborator: true
        },
        detailsproject: {
            _id: '',
            leader: '',
        },
        textforsearch: '',
        resultusers: [],
        delete_project_accept: '',
        index_project_position: '',
        hasNotifications: true,
        newNotifications: [{'notification': 'Haz sido invitado a un nuevo proyecto.'}]
    },
    computed: {
        clean() {
            cadena = this.idpm
            // Definimos los caracteres que queremos eliminar
            var specialChars = "!@#$^&%*()+=[]\/{}|:<>?,.";

            // Los eliminamos todos
            for (var i = 0; i < specialChars.length; i++) {
                cadena = cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
            }

            // Lo queremos devolver limpio en minusculas
            cadena = cadena.toLowerCase();

            // Quitamos espacios y los sustituimos por _ porque nos gusta mas asi
            cadena = cadena.replace(/ /g, "_");

            // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
            cadena = cadena.replace(/á/gi, "a");
            cadena = cadena.replace(/é/gi, "e");
            cadena = cadena.replace(/í/gi, "i");
            cadena = cadena.replace(/ó/gi, "o");
            cadena = cadena.replace(/ú/gi, "u");
            cadena = cadena.replace(/ñ/gi, "n");
            this.idpm = cadena
            return this.idpm
        }
    },
    methods: {
        modal: function () {
            m = document.getElementById('modal-p')
            m.classList.toggle('hidden')
            this.datap = {}
        },
        modalCreate: function () {
            t = document.getElementById('NUEVOTITULO')
            t.value = ''
            this.idpm = ''
            mC = document.getElementById('modal-c-p')
            mC.classList.toggle('hidden')
            document.getElementById('NUEVOTITULO').focus()
        },
        modalDelete: function () {
            mdp = document.getElementById('modal-d-p')
            mdp.classList.toggle('hidden')
            this.delete_project_accept = ''
            document.getElementById('class-delete-project').focus()

        },
        wCreate: function () {
            nt = document.getElementById('NUEVOTITULO')

            if (nt.value == 0 /*|| this.idpm == 0*/) {
                alert('¡Llena todos los campos!')
            } else {
                data = qstring.stringify({
                    title: nt.value,
                    //_id: this.idpm
                })
                axios.put(url + '/api/projects/' + 'momantai', data)
                    .then((response) => {
                        r = response.data
                        if (/*r.ok*/'ok' != 'ok') {
                            alert('¡Ya tienes un proyecto\ncon ese identificador!')
                        } else {
                            this.dataps.push({ 'leader': r.leader, 'task': [], 'project_id': r.project_id, 'title': r.title })
                            alert('¡Tienes un nuevo proyecto!')
                            nt.value = ''
                            //this.idpm = ''
                            this.modalCreate()
                        }
                    })
            }
        },
        selectProject: function (owner, id, data) {
            this.modal()
            this.datap = data
            axios.get(url + '/api/project/' + owner + '/' + id)
                .then((response) => {
                    this.datap = response.data
                    this.detailsproject = {
                        leader: owner,
                        _id: id
                    }
                })
                .catch((error) => {

                })
        },
        enterProject: function (owner, id) {
            global.ownerG = owner
            global.projectG = id
            window.location.href = "#pboard"
        },
        updateTitle: function () {
            if (this.datap.title.trim() != '') {
                data = qstring.stringify({
                    title: this.datap.title,
                    type: 'updateTitle'
                })

                axios.put(url + '/api/project/' + this.datap.leader + '/' + this.datap.project_id, data)
                    .then((response) => {
                        this.editprojectopt.name = true
                        console.log(response.data)
                    })
            }
        },
        updateDescription: function () {
            data = qstring.stringify({
                description: this.datap.details,
                type: 'updateDetails'
            })

            axios.put(url + '/api/project/' + this.datap.leader + '/' + this.datap.project_id, data)
                .then((response) => {
                    console.log(response.data)
                    this.editprojectopt.details = true
                })
        },
        alert: function () {
            a = document.getElementById('alertt')
            a.classList.toggle('displayhidden');
        },
        searchinTap: function () {
            text = this.textforsearch.trim()
            console.log(text)
            if (text.length >= 3) {
                axios.get(url + '/api/search-user/' + text)
                    .then((response) => {
                        this.resultusers = response.data
                        console.log(response)
                    })
            } else {
                this.resultusers = []
            }
        },
        inviteCollaborator: function (usertoInvite) {
            console.log(usertoInvite.user)

            data = qstring.stringify({
                collaborator: usertoInvite.user,
                type: 'addcoll'
            })

            axios.put(url + '/api/project/' + this.detailsproject.leader + '/' + this.detailsproject._id, data)
                .then((response) => {
                    if (response.data.ok == 'ok') {
                        this.datap.team.push(usertoInvite)
                    } else if (response.data.ok == 'UenP') {
                        alert('Ya es colaborador.')
                    } else {
                        alert('¡Este usuario no existe.')
                    }
                })
        },
        opentaskboard: function (user, project) {
            tb.loading = true;
            wboard.style.display = "block";

            axios.get(url + '/api/' + user + '/' + project + '/task')
                .then(response => {
                    (tb.task = response.data)
                    tb.dataconf = { 'user': user, 'project': project }
                    tb.tastap()
                    tb.loading = false
                })

            console.log(tb.task)

            pdataident = [user, project]
            urltask = url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/task'

            // wboard.style.display = "block";
        },
        consolelog: function () {
            console.log('Guardar')
        },
        consolelogo: function () {
            console.log('Cancelar')
        },
        deleteProject: function () {
            if (this.delete_project_accept == this.detailsproject.leader) {
                data = qstring.stringify({
                    type: 'deleteProject',
                    sure: true
                })

                axios.put(url + '/api/project/' + this.detailsproject.leader + '/' + this.detailsproject._id, data)
                    .then((response) => {
                        console.log(response.data)
                        this.dataps.splice(this.index_project_position, 1)
                        this.modalDelete()
                    })
            } else {
                alert('No se ha podido eliminar.')
            }
        },
        testdos: function () {
            data = qstring.stringify({
                list: "055cfc36-cda8-455a-ab3a-e912cdf2901b",
                _id: "a7c28714-be36-4205-a52f-071e3972277e",
                typeAction: 'deleteTask'
            })
            axios.put(url + '/api/momantai/506e687b-f1cb-4730-9ede-74ef164e328c/task', data)
                .then((response) => {
                    console.log(response.data)
                })
        }

    }
})