import os
import orjson

def output(_ : dict):
  if not (os.environ.get("DISABLE_NODE_OUTPUT",False)):
    print(orjson.dumps(_).decode("utf-8"))

def printJSON(_ : dict, indent = None):
    print(orjson.dumps(_,option=orjson.OPT_INDENT_2).decode("utf-8"))

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

