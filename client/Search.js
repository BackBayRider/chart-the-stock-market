import React from 'react'

class Search extends React.Component {
	render() {
		return (
			<div>
				<input
					type = "text"
					className = 'search'
					placeholder = 'Add a New Stock'
					value = {this.props.inputSymbol}
					onChange = {this.props.handleInput} /><br />
				<button className = 'searchBtn' onClick = {this.props.addStock}>Add a new stock</button>
			</div>
		);
	}
};

export default Search;


