const amqp = require('amqplib');

amqp.connect('amqp://guest:guest@192.168.235.57:5672').then(conn => {
    process.once('SIGINT', () => {conn.close();});
    return conn.createChannel().then(channel => {
        var ok = channel.assertQueue('iot/logs/ph', {durable:false});
        ok = ok.then(_qok => {          
            return channel.consume('iot/logs/ph', msg => {
                console.log('New ph level measurement: ', msg.content.toString());           
            }, {noAck: true});
        }); 
        return ok.then(_consumeOk => {
            console.log('Waiting for messages...');
        });
    });
}).catch(console.warn);