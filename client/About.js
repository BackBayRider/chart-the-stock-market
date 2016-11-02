import React from 'react'

class About extends React.Component {
	render() {
		return (
			<div className = 'aboutComponent'>
				<div className = 'aboutContent'>
					<h2>This is a project for<br/>
						<a target = "_blank" href = "https://www.freecodecamp.com/challenges/chart-the-stock-market">
							Free Code Camp
						</a>
					</h2>
					<p>You can search for US stocks by symbol and view recent price data. Any stocks you add or remove 
						will be updated in real time on any other device viewing this page.</p>
					<button onClick = {this.props.toggleInfo}>Close</button>
				</div>
			</div>
		);
	}
};

export default About;


