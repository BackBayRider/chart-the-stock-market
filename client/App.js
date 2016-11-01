import React from 'react'
import { render } from 'react-dom'

import Chart from './Chart'

import './theme/style.scss'

const socket = io.connect('http://localhost:3000');

class App extends React.Component {
	constructor() {
		super();

		this.state = {
			inputSymbol: '',
			stocks: []
		}

		this.handleInput = this.handleInput.bind(this);
		this.addStock = this.addStock.bind(this);
		this.removeStock = this.removeStock.bind(this);
	}
	componentWillMount() {

		// need to fetch all stocks from server/API on page load and save to component state
		//let socket = io.connect('http://localhost:3000');
		
		socket.emit('init');
		socket.on('init-stock', (data) => {
			const { stocks } = this.state;
			const updatedStocks = [...stocks, data];
			this.setState({
				stocks: updatedStocks
			});
		});

	}
	componentDidMount() {

		//let socket = io.connect('http://localhost:3000');
		
		// listen for any stocks added by other clients and add them to local state
		socket.on('stock-added', (data) => {
			console.log('Received new data:', data);
			const { stocks } = this.state;
			const updatedStocks = [...stocks, data];
			this.setState({
				stocks: updatedStocks
			});
		});
		
		// listen for any stocks removed by other clients and remove them from local state
		socket.on('stock-removed', (symbol) => {
			const { stocks } = this.state;
			const updatedStocks = stocks.filter( (stock) => {
				return stock.dataset.dataset_code !== symbol;
			});
			this.setState({
				stocks: updatedStocks
			});
		});

	}
	handleInput(e) {
		this.setState({
			inputSymbol: e.target.value
		});
	}
	addStock() {
		const { inputSymbol } = this.state;
		//let socket = io.connect('http://localhost:3000');
		if (inputSymbol !== '') { socket.emit('add', inputSymbol) }
	}
	removeStock(ticker, idx) {
		// remove stock from local state
		const { stocks } = this.state;
		stocks.splice(idx, 1);

		this.setState({
			stocks: stocks
		});
		// dispatch action to server to remove stock from from databse and broadcast remove event to all listeners
		//let socket = io.connect('http://localhost:3000');
		socket.emit('remove-stock', ticker);
	}
	render() {
		const renderStocks = this.state.stocks.map( (stock, idx) => {
			return (
				<div key = {idx} className = 'stockContainer'>
					<span className = 'stockTitle'>{stock.dataset.dataset_code}</span>
					<i className = "fa fa-trash" aria-hidden="true" onClick = {this.removeStock.bind(this, stock.dataset.dataset_code, idx)}></i>
				</div>
			);
		});
		return (
			<div className = 'main'>
				<h1 className = 'title'>Chart the Stock Market</h1>
				<div>
					<input
						type = "text"
						className = 'search'
						placeholder = 'Add a New Stock'
						value = {this.state.inputSymbol}
						onChange = {this.handleInput} /><br />
					<button className = 'searchBtn' onClick = {this.addStock}>Add a new stock</button>
				</div>
				<Chart />
				<h2>Current Stocks:</h2>
				<div className = 'stocksWrapper'>
					{renderStocks}
				</div>
			</div>
		);
	}
};

render(<App />, document.getElementById('app-root'));


