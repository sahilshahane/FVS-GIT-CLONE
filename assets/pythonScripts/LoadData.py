import os
import orjson
from pathlib import Path


def GET_APP_FOLDER_PATH():
  isDev = os.environ.get("development",False)

  if(isDev):
    return os.path.normpath("assets/installation/.usp")
  else:
    return os.path.join(Path.home(),".usp")

def LOAD_COMMUNICATION_CODES():
  COMMUNICATION_CODES_FILE_PATH = os.path.join(GET_APP_FOLDER_PATH(), "Communication_Codes.json")

  # LOAD THE COMMUNICATION CODES
  with open(COMMUNICATION_CODES_FILE_PATH,"rb") as file_:
      CCODES = orjson.loads(file_.read())

  return CCODES

def LOAD_APP_SETTINGS():
  APP_SETTINGS_PATH = os.path.join(GET_APP_FOLDER_PATH(), "Appsetting.json")

  with open(APP_SETTINGS_PATH,"rb") as file_:
      APP_SETTINGS = orjson.loads(file_.read())

  return APP_SETTINGS
