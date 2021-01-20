import orjson
import json

def output(_):
    # pass
    print(orjson.dumps(_).decode("utf-8"))

def output_direct(_):
    # pass
    print(_)
