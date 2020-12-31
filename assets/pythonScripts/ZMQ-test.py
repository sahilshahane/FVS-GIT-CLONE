import time
import zmq
PORT = 3001
context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind(f"tcp://127.0.0.1:{PORT}")
print(f"Started Server at Port : {PORT}")
while True:
    #  Wait for next request from client
    message = socket.recv()
    print(f"Received request: {message}")

    #  Do some 'work'
    time.sleep(1)
    #  Send reply back to client
    socket.send(b"World")
