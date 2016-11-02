import express from 'express'
import axios from 'axios'
import assert from 'assert'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config();

import mongoose from 'mongoose'
import mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient;
const DB_URL = process.env.MONGO_HOST;

const app = express();
 
// Run server to listen on port 3000.
const server = app.listen(3000, () => {
  console.log('listening on *:3000');
});
 
const io = require('socket.io')(server);
 
app.use(bodyParser.urlencoded({ extended: false } ));
app.use(express.static('static'));

// test database connection
MongoClient.connect(DB_URL, (err, db) => {
	assert.equal(null, err);
	console.log('Connected through MongoClient');
	db.close();
});
 
io.on('connection', (socket) => {
	// inital connection of any client
  console.log('a user connected');
 
 	// for initial page load query database for all current stocks
 	// then for each retrieve price data from api endpoint
	socket.on('init', () => {
		MongoClient.connect(DB_URL, (err, db) => {
			assert.equal(null, err);
			// retrieve stocks list from database
			db.collection('stocks').find().toArray( (error, response) => {
				if (!err) {
					let data = [];
					socket.emit('inform-length', response.length);
					for (let i = 0; i < response.length; i++) { data[i] = response[i].symbol }
					// map over the data from the stocks collection and return each to clients through socket.io
					data.map( (ticker) => {
						axios.get('https://www.quandl.com/api/v3/datasets/WIKI/' + ticker + '.json?api_key=' + process.env.QUANDL_KEY).then( (response) => {
							socket.emit('init-stock', response.data);
						}).catch(err => console.log(err));
					});
					db.close();
				}
			});
		});
	});

	// for a new stock added on a client retrieve price data from api and return to all connected clients
	// separately insert new symbol into database of stocks list
	socket.on('add', (stock) => {
		console.log(`Fetching price data for ${stock} from Quandl API`);

		axios.get('https://www.quandl.com/api/v3/datasets/WIKI/' + stock + '.json?api_key=' + process.env.QUANDL_KEY).then( (response) => {
			// receive data, emit response to all listeners with symbol and data for update
			socket.emit('stock-added', response.data);
			socket.broadcast.emit('stock-added', response.data);

			// insert stock into database
			MongoClient.connect(process.env.MONGO_HOST, (err, db) => {
				assert.equal(null, err);
				console.log(`Inserting ${stock} into database`);
				db.collection('stocks').insertOne({ symbol: stock });
				db.close();
			});
		}).catch( (err) => {
			console.log(err);
			socket.emit('lookup-error', 'This symbol could not be found!');
		});
	});

	socket.on('remove-stock', (symbol) => {
		console.log('Received remove request for', symbol);
		MongoClient.connect(DB_URL, (err, db) => {
			assert.equal(null, err);
			db.collection('stocks').remove(
				{ symbol: symbol },
				{
					justOne: true
				}
			);
			socket.broadcast.emit('stock-removed', symbol);
			socket.emit('stock-removed', symbol);
		});
	});

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});