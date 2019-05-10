/*
    Imports.
*/

const Vue = require('vue/dist/vue')
const axios = require('axios')
const InputTag = require('vue-input-tag')
const vuedrag = require('vuedraggable')
const fdata = require('form-data')

qstring = require('querystring')
fetch = require('node-fetch')

console.log("¡Iniciando aplicación!")

/* 
    Configuration.
*/

// let url = 'https://pmanagerd.mybluemix.net'
let url = 'http://0.0.0.0:5000'
//let url = 'http://www.cloudmomantai.ml'

var urltask = url + '/api/' + 'momantai' + '/' + 'nuevo' + '/task'

var pdataident = []

const socket = require('socket.io-client')(url + '/view')

Vue.component('input-tag', InputTag.default)
Vue.component('draggable', vuedrag)
