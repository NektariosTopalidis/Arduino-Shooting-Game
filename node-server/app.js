const express = require('express');
const app = express();

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);



const SerialPort = require('serialport').SerialPort;
const { ReadlineParser } = require('@serialport/parser-readline');

const port = new SerialPort({
    path: 'COM3',
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
},(err) => {
    if(err){
        console.log(err.message);
    }
    else{
        console.log('YOOOO');
    }
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))

parser.on('data', (data) => {
    splitData = data.split(' ');
    if(splitData[0] == 'rotation'){
        // console.log(splitData[1]);
        io.emit('rotation',splitData[1]);
    }
    else if(data === 'UP' || data === 'DOWN' || data === 'LEFT' || data === 'RIGHT' || data === 'STOP'){
        // console.log(data);
        io.emit('move_data',data);
    }
    else{
        console.log(data);
    }
})

io.on('connection', client => {
    console.log('Connected');
    client.on('lostLife', () => {
        port.write('1', (err) => {
            if (err) {
              return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    });
    client.on('gameEnd', () => {
        port.write('2', (err) => {
            if (err) {
              return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    });
    client.on('killedEnemy', () => {
        port.write('3', (err) => {
            if (err) {
              return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    });
    client.on('wonGame', () => {
        port.write('4', (err) => {
            if (err) {
              return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    });
    client.on('disconnect', console.log);
});

server.listen('3000', () => {
    console.log('Listening...');
})