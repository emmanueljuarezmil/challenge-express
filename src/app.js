var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
    clients: {},

    reset: function() {
        this.clients = {}
    },

    addAppointment: function(name, date) {
        date.status = 'pending'
        
        if(!this.clients[name]) {
            this.clients[name] = [date]
        }
        else {
            this.clients[name].push(date)
        }
        return date
    },

    attend: function(name, date) {
        for (let i = 0; i < this.clients[name].length; i++) {
            if(this.clients[name][i].date === date){
                this.clients[name][i].status = 'attended'
            }
        }
    },

    expire: function(name, date) {
        for (let i = 0; i < this.clients[name].length; i++) {
            if(this.clients[name][i].date === date){
                this.clients[name][i].status = 'expired'
            }
        }
    },

    cancel: function(name, date) {
        // name --> 'javier'
        // date --> '22/10/2020 14:00'
        var filterDate = this.clients[name].find(element =>
            element.date === date)
        
        filterDate.status = 'cancelled'
        return filterDate
    //     let filterDate = date.filter(() => {

    //     })

    },


    erase: function(name, dateOStatus) {
        // dateOStatus --> '22/10/2020 12:00'
        // dateOStatus --> 'cancelled'
        if(dateOStatus.includes('/')) {
            this.clients[name] = this.clients[name].filter(element => 
                element.date !== dateOStatus
            )
        }
        else {
            this.clients[name] = this.clients[name].filter(element => 
                element.status !== dateOStatus
            )
        }
    },

    getAppointments: function(client, status) {
        // if(status) {
        //     return this.clients[client].filter(element => 
        //         element.status === status)
        // }
        // else {
        //     return this.clients[client]
        // }

        return status ? this.clients[client].filter(element => 
            element.status === status) :
             this.clients[client]
    },

    getClients: function() {
        return Object.keys(this.clients)
    },
};



server.use(express.json());

server.get('/api', (req, res) => {
    return res.send(model.clients)
})

server.post('/api/Appointments', (req, res) => {
    // const client = req.body.client
    const {client, appointment} = req.body
    if(!client) {
        return res.status(400).send('the body must have a client property')
    }
    if(typeof client !== 'string') {
        return res.status(400).send('client must be a string')
    }
    
    res.send(model.addAppointment(client, appointment))
})

server.get("/api/Appointments/clients", (req, res) => {
    return res.send(model.getClients());
});

server.get('/api/Appointments/:name', (req, res) => {
    // /api/Appointments/pepe?date=22/10/2020%2014:00&option=attend
    //                 params|querys
    // los : indica que recibe un algo que va a pasar a ser req.params, en caso de :name req.params.name
    // los : los pongo para decirle a mi metodo que se espera recibir un param ahi, la url del req no trae esos :
    // el ? indica donde termina la url y empiezan las querys, y tienen el formato nombredevalor1=valor1&nombredevalor2=valor2
    // entonces, req.query.date = 22/10/2020%2014:00 y req.query.option=attend
    const {name} = req.params
    const {option, date } = req.query
    if(!model.clients[name]) return res.status(400).send('the client does not exist')
    var haveDate = model.clients[name].filter(c => c.date === date)
    if(!haveDate.length) return res.status(400).send('the client does not have a appointment for that date')

    switch(option) {
        case 'attend': model.attend(name, date)
        break
        case 'expire': model.expire(name, date)
        break
        case 'cancel': model.cancel(name, date)
        break
        default: return res.status(400).send('the option must be attend, expire or cancel')
    }
    haveDate = model.clients[name].find(c => c.date === date)
    return res.send(haveDate)
})


server.get('/api/Appointments/:name/erase', (req, res) => {
    const {name} = req.params
    const {date} = req.query

    if(!model.clients[name]) {
        return res.status(400).send('the client does not exist')
    }

    const auxDate = model.clients[name].find(c => c.date === date || c.status === date );
    if(auxDate) {
        model.erase(name, date);
    };
    return res.send([auxDate]);
    
})

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
    const { name } = req.params
    const { status } = req.query
    res.send(model.getAppointments(name, status));
});


server.listen(3000);
module.exports = { model, server };