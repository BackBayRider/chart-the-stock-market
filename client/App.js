import React from 'react'
import { render } from 'react-dom'

import Search from './Search'
import Chart from './Chart'

import './theme/style.scss'

const socket = io.connect('http://localhost:3000');

class App extends React.Component {
	constructor() {
		super();

		this.state = {
			inputSymbol: '',
			stocks: [],
			loading: true,
			initialLoad: true
		}

		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.addStock = this.addStock.bind(this);
		this.removeStock = this.removeStock.bind(this);

	}
	componentWillMount() {

		window.addEventListener('keypress', this.handleKeyPress);

		// need to fetch all stocks from server/API on page load and save to component state
		socket.emit('init');
		socket.on('inform-length', (num) => {
			this.setState({
				dataLength: num
			});
		});
		socket.on('init-stock', (data) => {
			const { stocks } = this.state;
			const updatedStocks = [...stocks, data];
			this.setState({
				stocks: updatedStocks
			});
			if (updatedStocks.length === this.state.dataLength) {
				this.setState({
					loading: false,
					initialLoad: false,
					inputSymbol: ''
				});
			}
		});

	}
	componentDidMount() {
		
		// listen for any stocks added by other clients and add them to local state
		socket.on('stock-added', (data) => {
	
			const { stocks } = this.state;
			const updatedStocks = [...stocks, data];
			this.setState({
				stocks: updatedStocks,
				loading: false
			});
		});

		// catch error if api return 404 for stock symbol
		socket.on('lookup-error', (message) => {
			alert(message);
			this.setState({
				loading: false
			});
		});
		
		// listen for any stocks removed by other clients and remove them from local state
		socket.on('stock-removed', (symbol) => {
			const { stocks } = this.state;
			const updatedStocks = stocks.filter( (stock) => {
				return stock.dataset.dataset_code !== symbol.toUpperCase();
			});
			this.setState({
				stocks: updatedStocks
			});
		});

	}
	handleKeyPress(e) { if (e.keyCode === 13) { this.addStock() }}
	handleInput(e) {
		this.setState({
			inputSymbol: e.target.value
		});
	}
	addStock() {
		const { stocks, inputSymbol } = this.state;
		const ticker = inputSymbol.trim().toUpperCase();
		// make sure initla date is finished loading
		if (!this.state.initialLoad) {
			// make sure user input is not empty
			if (inputSymbol !== '') {
				function preventDuplicate(ticker) {
					for (let i = 0; i < stocks.length; i++) {
						if (stocks[i].dataset.dataset_code === ticker) {
							return true;
						}
					}
					return false;
				}
				// make sure stock symbol is not already listed
				if (preventDuplicate(ticker)) {
					alert('This stock is already listed!');
					this.setState({
						inputSymbol: ''
					});
					// dispatch add action through socket.io
				} else {
					socket.emit('add', ticker);
					this.setState({
						inputSymbol: '',
						loading: true
					});
				}
			}
		}
	}
	removeStock(ticker) {
		if (!this.state.initialLoad) {
			// remove stock from local state
			const { stocks } = this.state;
			const updatedStocks = stocks.filter( (stock) => {
				return stock.dataset.dataset_code !== ticker.toUpperCase();
			});
			this.setState({
				stocks: updatedStocks
			});
			// dispatch action to server to remove stock from from databse and broadcast remove event to all listeners
			socket.emit('remove-stock', ticker);
		}
	}
	render() {
		const renderStocks = this.state.stocks.map( (stock, idx) => {
			return (
				<div key = {idx} className = 'stockContainer' onClick = {this.removeStock.bind(this, stock.dataset.dataset_code, idx)}>
					<span className = 'stockTitle'>{stock.dataset.dataset_code}</span>
					<i className = "fa fa-trash" aria-hidden="true"></i>
				</div>
			);
		});
		const { stocks } = this.state;
		return (
			<div className = 'main'>
				<h1 className = 'title'>Chart the Stock Market</h1>
				<p className = 'twitterLink'>
					<a target = "_blank" href="https://twitter.com/bonham_000">@bonham000</a>
				</p>
				<Search
					inputSymbol = {this.state.inputSymbol} 
					handleInput = {this.handleInput}
					addStock = {this.addStock} />
				{ this.state.loading && <p className = 'loadingMsg'>Please wait, the data is loading...</p> }
				<Chart stockData = {stocks} initStatus = {this.state.initialLoad} />
				<h2 className = 'currentStocksTitle'>Current Stocks (click to remove):</h2>
				<div className = 'stocksWrapper'>
					{renderStocks}
				</div>
			</div>
		);
	}
};

render(<App />, document.getElementById('app-root'));


