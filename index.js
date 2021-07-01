const amqp = require('amqplib');
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

var measurements = [];

amqp.connect('amqp://guest:guest@192.168.235.57:5672').then(conn => {
    process.once('SIGINT', () => {conn.close();});
    return conn.createChannel().then(channel => {
        var ok = channel.assertQueue('iot/logs/ph', {durable:false});
        ok = ok.then(_qok => {          
            return channel.consume('iot/logs/ph', msg => {
                measurements.push(msg.content.toString());
            }, {noAck: true});
        }); 
        return ok.then(_consumeOk => {
            console.log('Waiting for messages...');
        });
    });
}).catch(console.warn);

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

router.post('/measurements', (req, res) => {
    res.json(measurements);
});

app.use('/', router);
app.listen(3000);
console.log('Server running on http://localhost:3000');

