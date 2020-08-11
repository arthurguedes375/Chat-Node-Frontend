import React, { Component } from 'react';

import io from 'socket.io-client';


import Swal from 'sweetalert2';

import './App.css';

class App extends Component {

    state = {
        username: '',
        message: '',

        messages: [],
        socket: null
    }

    constructor(props) {
        super(props);

        this.startConnection = this.startConnection.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }


    async sendMessage(e) {
        e.preventDefault();

        let { socket, messages } = this.state;

        const data = {
            author: this.state.username,
            message: this.state.message
        };

        if (data.author && data.message) {
            await socket.emit("sendMessage", data);
            if (messages.length > 0) {
                messages.push(data);
            } else {
                messages = [];
                messages.push(data);
            }
            this.setState({ messages, message: '' });
        }
    }

    async startConnection() {
        let socket = io('http://localhost:5000');

        socket.on("internalServerError", (data) => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: data.message,
            })
        });

        socket.on("previousMessages", (data) => {
            this.setState({ messages: data });
        });

        socket.on("receivedMessage", (data) => {
            let { messages } = this.state;
            messages.push(data);
            this.setState({ messages });
        });

        await this.setState({ socket });
    }

    componentDidMount() {
        this.startConnection();
    }

    render() {
        return (
            <div className="App">
                <form id="chat" onSubmit={e => this.sendMessage(e)}>
                    <input type="text" name="username"
                        placeholder="Digite seu Nome..."
                        autoComplete="off"
                        value={this.state.username}
                        onChange={(e) => this.setState({ username: e.target.value })}
                    />
                    <div className="messages">
                        {(this.state.messages.length > 0) ? this.state.messages.map((message) => <div className="message"><strong>{message.author}</strong>: {message.message}</div>) : null}
                    </div>

                    <div className="sub">
                        <input type="text" name="message"
                            placeholder="Digite sua Mensagem..."
                            autoComplete="off"
                            value={this.state.message}
                            onChange={(e) => this.setState({ message: e.target.value })}
                        />
                        <button type="submit">Enviar</button>
                    </div>



                </form>
            </div>
        );
    }
}

export default App;