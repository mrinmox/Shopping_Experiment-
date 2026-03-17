import asyncio
import json

import websockets
from pylsl import StreamInfo, StreamOutlet

# Set up LSL marker stream
info = StreamInfo(
    name="jsPsych_Markers",
    type="Markers",
    channel_count=1,
    nominal_srate=0,
    channel_format="string",
    source_id="jspsych_lsl_ws",
)
outlet = StreamOutlet(info)
print("LSL marker stream created: jsPsych_Markers")

connected_clients = set()


async def handler(websocket):
    connected_clients.add(websocket)
    print(f"Client connected. Total: {len(connected_clients)}")
    try:
        async for message in websocket:
            data = json.loads(message)
            marker = str(data.get("marker", "0"))
            outlet.push_sample([marker])
            print(f"Sent marker: {marker}")
            await websocket.send(json.dumps({"status": "ok", "marker": marker}))
    except websockets.ConnectionClosed:
        print("Client disconnected")
    finally:
        connected_clients.discard(websocket)


async def main():
    async with websockets.serve(handler, "127.0.0.1", 5001):
        print("WebSocket server running on ws://127.0.0.1:5001")
        await asyncio.Future()  # run forever


asyncio.run(main())
