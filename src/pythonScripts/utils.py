import os
import orjson

def output(_ : dict):
  if(os.environ.get("SHOW_NODE_OUTPUT",True)):
    print(orjson.dumps(_).decode("utf-8"))

def output_direct(_):
    # pass
    print(_)

def loadFile(filePath : str, mode = "r"):
  return open(filePath, mode)

def loadJSON(filePath):
  file_ = loadFile(filePath)
  data = orjson.loads(file_.read())
  file_.close()
  return data

def saveJSON(filePath : str, data: dict, encode : str = "utf-8"):
  with open(filePath,"w") as file_:
    file_.write(orjson.dumps(data).decode(encode))
    file_.close()

