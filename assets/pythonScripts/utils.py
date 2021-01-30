import os
import orjson
import io

def output(_ : dict):
  if(os.environ.get("SHOW_NODE_OUTPUT",True)):
    print(orjson.dumps(_).decode("utf-8"))

def output_direct(_):
    # pass
    print(_)

def loadFile(filePath : str, mode = "r"):
  return open(filePath, mode)

def loadJSON(filePath):
  if isinstance(filePath, str):
    file_ = loadFile(filePath)
    data = orjson.loads(file_.read())
    file_.close()
    return data
  elif isinstance(filePath,io.TextIOWrapper):
    return orjson.loads(filePath.read())
  else:
    raise TypeError()
def saveJSON(filePath : str, data: dict, encode : str = "utf-8"):
  with open(filePath,"r") as file_:
    file_.write(orjson.dumps(data).decode(encode))
    data = orjson.loads(file_.read())
    file_.close()
