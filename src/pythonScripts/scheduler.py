import sys
import os
import argparse
import orjson
import threading
import shutil

from utils import output
from LoadData import LOAD_COMMUNICATION_CODES,LOAD_APP_SETTINGS,GET_APP_FOLDER_PATH
from DrivePart import GoogleDrive
import main

args_const = argparse.ArgumentParser()
args_const.add_argument('-dev',"--development", action="store_true")
args_const.add_argument('-node',"--isGUI", action="store_true")
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

DOWNLOADS_QUEUE = []
UPLOADS_QUEUE = []

def getGDriveService():
  global GDRIVE_SERVICE

  if not GDRIVE_SERVICE:
    GDRIVE_SERVICE = GoogleDrive.get_gdrive_service(CCODES)

  return GDRIVE_SERVICE

def startGoogleLogin(task):
  service = GoogleDrive.startLogin(CCODES)
  userInfo = GoogleDrive.getUSERInfo(CCODES,service)
  output({"code":CCODES["GOOGLE_LOGIN_SUCCESS"],"msg":"Google Login Was Successfull!","data": userInfo})

def Init_Dir(task):
  DIR_PATH = task["data"]["path"]
  main.initialize(CCODES,APP_SETTINGS,DIR_PATH,force = task.get('force'))

def uploadFile(task):
  pass

def resumeUpload(task):
  pass

def generateGDriveID(task):
  count = task["data"]["count"]
  RepoID = task["data"]["RepoID"]
  service = getGDriveService()
  ids = GoogleDrive.generateIDs(CCODES,count,service)
  output({"code":CCODES["GENERATE_IDS"], "data" : {"ids" : ids, "RepoID" : RepoID}})

def allocateIDs(task):
  DIR_PATH = task["data"]["path"]
  service = getGDriveService()
  GoogleDrive.allocateGFID(CCODES,DIR_PATH,service)

# do not use this, for now
def uploadRepository(task):
  DIR_PATH = task["data"]["path"]
  service = getGDriveService()
  GoogleDrive.uploadRepository(CCODES,DIR_PATH,service)

def retriveUploads(task):
  DIR_PATH = task["data"]["path"]
  RepoID = task["data"]["RepoID"]
  main.showUploads(CCODES,DIR_PATH,RepoID)

TASKS_DEFINITIONS = {
  CCODES["START_GOOGLE_LOGIN"] : startGoogleLogin,
  CCODES["INIT_DIR"] : Init_Dir,
  CCODES["UPLOAD_FILE"]: uploadFile,
  CCODES["GENERATE_IDS"]: generateGDriveID,
  CCODES["RETRIVE_REPO_UPLOADS"] : retriveUploads
}

def addTask(task):
  # TASK_QUEUE.append(TASKS_DEFINITIONS[task.code])
  threading.Thread(target=TASKS_DEFINITIONS[task["code"]],args=[task]).start()

def nodeMain():
  output({"CCODES": CCODES,"APP_HOME_PATH": os.environ["APP_HOME_PATH"], "isDev": args.development })

  # MAIN LOOP
  while(True):
    task = sys.stdin.readline()[:-1]

    try:
      task = orjson.loads(task)
      if(task): addTask(task)
    except:
      pass

def aloneMain():
  DIR_PATH = os.path.abspath("Testing")

  os.environ["SHOW_NODE_OUTPUT"] = ''

  task = {"data":{"path":DIR_PATH,"RepoID":1}}
  # try:
  #   shutil.rmtree(os.path.join(DIR_PATH,'.usp'))
  # except Exception:
  #   pass

  # Init_Dir(task)
  # allocateIDs(task)
  # uploadRepository(task)

  retriveUploads(task)







if(args.isGUI):
  nodeMain()
elif(not args.node and args.development):
  aloneMain()
