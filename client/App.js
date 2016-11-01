import React from 'react'
import { render } from 'react-dom'

class App extends React.Component {
	componentWillMount() {
		let socket = io.connect('http://localhost:3000');
	  socket.on('news', function (data) {
	    console.log(data);
	    socket.emit('my other event', { my: 'data' });
	  });
	}
	render() {
		return (
			<div>
				<h1>HELLO FROM webpack</h1>
			</div>
		);
	}
};

render(<App />, document.getElementById('app-root'));