import sys
import os
import argparse
import orjson
import threading

from log import output
from LoadData import LOAD_COMMUNICATION_CODES,LOAD_APP_SETTINGS,GET_APP_FOLDER_PATH
from DrivePart import GoogleDrive
import main

args_const = argparse.ArgumentParser()
args_const.add_argument('-dev',"--development", action="store_true")
args = args_const.parse_args()

APP_FOLDER_PATH = None # APP's Main Folder, Where we are going to store App related Files # APP's Main Folder, Where we are going to store App related Files
CCODES = None # COMMUNICATION CODES
APP_SETTINGS = None # APP SETTINGS

if args.development: os.environ["development"] = "1"

CCODES = LOAD_COMMUNICATION_CODES()
APP_SETTINGS = LOAD_APP_SETTINGS()

os.environ["APP_HOME_PATH"] = GET_APP_FOLDER_PATH()
os.environ["DEFAULT_REPO_FOLDER_PATH"] = ".usp"
os.environ["DEFAULT_REPO_DATA_FOLDER_PATH"] = os.path.join(os.environ["DEFAULT_REPO_FOLDER_PATH"],"data")
os.environ["DEFAULT_REPO_LOG_FOLDER_PATH"] =  os.path.join(os.environ["DEFAULT_REPO_FOLDER_PATH"],"logs")
os.environ["DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH"] =  os.path.join(os.environ["DEFAULT_REPO_FOLDER_PATH"],"c_storage")
os.environ["DEFAULT_REPO_SETTINGS_FILE_PATH"] = os.path.join(os.environ["DEFAULT_REPO_FOLDER_PATH"],"repositorySettings.json")
os.environ["DEFAULT_REPO_COMMIT_FILE_PATH"] = os.path.join(os.environ["DEFAULT_REPO_FOLDER_PATH"],"commit.json")

GDRIVE_SERVICE = None

def getGDriveService():
  global GDRIVE_SERVICE

  if not GDRIVE_SERVICE:
    GDRIVE_SERVICE = GoogleDrive.get_gdrive_service(CCODES)

  return GDRIVE_SERVICE

output({"CCODES": CCODES,"APP_HOME_PATH": os.environ["APP_HOME_PATH"], "isDev": args.development })

def startGoogleLogin(task):
  service = GoogleDrive.startLogin(CCODES)
  userInfo = GoogleDrive.getUSERInfo(CCODES,service)
  output({"code":CCODES["GOOGLE_LOGIN_SUCCESS"],"msg":"Google Login Was Successfull!","data": userInfo})

def Init_Dir(task):
  DIR_PATH = task["data"]["path"]
  main.initialize(CCODES,APP_SETTINGS,DIR_PATH,force = task.get('force'))

TASKS_DEFINITIONS = {
  CCODES["START_GOOGLE_LOGIN"] : startGoogleLogin,
  CCODES["INIT_DIR"] : Init_Dir
}

def addTask(task):
  # TASK_QUEUE.append(TASKS_DEFINITIONS[task.code])
  threading.Thread(target=TASKS_DEFINITIONS[task["code"]],args=[task]).start()

# MAIN LOOP
while(True):
  task = sys.stdin.readline()[:-1]

  try:
    task = orjson.loads(task)
    if(task): addTask(task)
  except:
    pass
