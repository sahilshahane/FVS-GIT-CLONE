import sys
import os
import argparse
import threading
from typing import Dict
import orjson
from utils import output, loadJSON
from LoadData import LOAD_COMMUNICATION_CODES,LOAD_APP_SETTINGS,GET_APP_FOLDER_PATH
from DrivePart import GoogleDrive
import main

args_const = argparse.ArgumentParser()
args_const.add_argument('-dev',"--development", action="store_true")
args_const.add_argument('-node',"--isGUI", action="store_true")
launchArgs = args_const.parse_args()

CCODES = None # COMMUNICATION CODES
APP_SETTINGS = None # APP SETTINGS

if launchArgs.development: os.environ["development"] = "1"
if launchArgs.isGUI: os.environ["isGUI"] = "1"

CCODES = LOAD_COMMUNICATION_CODES()
APP_SETTINGS = LOAD_APP_SETTINGS()

os.environ["APP_HOME_PATH"] = GET_APP_FOLDER_PATH()
os.environ["DEFAULT_REPO_FOLDER_PATH"] = ".usp"
os.environ["DEFAULT_DB_FILE_NAME"] = "database.db"
os.environ["TESTING_FOLDER"] =  os.path.join('..','..',"Testing")

def defaultWrapper(callback, task:Dict):
  response = {}

  try:
    response = callback(task)
  except Exception as e:
    response = {"code":task["code"], "failed": True,  "exception": {"msg":str(e),"type": str(e.__class__.__name__)}}
    if(task.get('data')): response["data"] = task["data"]

  output(response)

GDRIVE_SERVICE = None

DOWNLOADS_QUEUE = []
UPLOADS_QUEUE = []

def getGDriveService():
  global GDRIVE_SERVICE

  if not GDRIVE_SERVICE:
    GDRIVE_SERVICE = GoogleDrive.getService(CCODES)

  return GDRIVE_SERVICE

def startGoogleLogin(task=None):
  GoogleDrive.startLogin(CCODES)
  userInfo = GoogleDrive.getUSERInfo(CCODES)
  return {"code":CCODES["GOOGLE_LOGIN_SUCCESS"],"msg":"Google Login Was Successfull!","data": userInfo}

def Init_Dir(task):
  DIR_PATH = task["data"]["localPath"]

  try:

    main.initialize(CCODES,APP_SETTINGS,DIR_PATH,force = task['data'].get('force'))

    # DEFAULT REPOSITORY NAME
    task["data"]['RepositoryName'] = os.path.basename(DIR_PATH)

    # FINALLY NOTIFY THE CALLER / GUI / NODEjs
    return {"code":CCODES["INIT_DONE"],"msg":"Repository Initialization Completed","data": task["data"]}
  except FileExistsError as e:
    return {"code":CCODES["INIT_FAILED"],"msg":"Repository Initialization Failed","data":task["data"] , "exception":{"code":e.errno,"type": e.__class__.__name__}}

def uploadFile(task):
  RepoID = task["data"]["RepoID"]
  driveID = task["data"].get("driveID")
  fileName = task["data"]["fileName"]
  filePath = task["data"]["filePath"]
  parentDriveID = task["data"]["parentDriveID"]

  try:
    driveID = GoogleDrive.uploadFile(CCODES, RepoID, fileName, filePath, driveID, parentDriveID)

    return {
    "code":CCODES["UPLOAD_SUCCESS"],
    "data" : {
      "RepoID" : RepoID,
      "driveID" : driveID,
      "fileName" : fileName,
      "parentPath" : os.path.dirname(filePath)
    }}

  except Exception as e:
    return { "code":CCODES["UPLOAD_FAILED"], "data" : task["data"], "exception": {"msg":str(e),"type": str(e.__class__.__name__)}}

def downloadFile(task):
  RepoID = task["data"]["RepoID"]
  driveID = task["data"].get("driveID")
  fileName = task["data"]["fileName"]
  filePath = task["data"]["filePath"]

  try:
    GoogleDrive.downloadFile(CCODES, driveID, fileName, filePath, RepoID)

    return {
      "code": CCODES["DOWNLOAD_SUCCESS"],
      "data": {
        "RepoId": RepoID,
        "fileName" : fileName,
        "parentPath" : os.path.dirname(filePath)
      }
    }
  except Exception as e:
    return {
      "code": CCODES["DOWNLOAD_FAILED"],
      "data": task["data"],
      "exception": {
        "msg":str(e),
        "type": str(e.__class__.__name__)
      }
    }

def generateGDriveID(task):
  count = task["data"]["count"]
  RepoID = task["data"]["RepoID"]
  ids = GoogleDrive.generateIDs(CCODES,count)
  return {"code":CCODES["GENERATE_IDS"], "data" : {"ids" : ids, "RepoID" : RepoID}}

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

def createRepoFolders(task):
  RepoID = task["data"]["RepoID"]
  rootFolderName = task["data"]["RepoName"]
  rootFolderPath = task["data"]["folderPath"]
  folderData = task["data"]["folderData"]
  try:
    folderData = GoogleDrive.createRepoFolders(CCODES,RepoID,rootFolderName, rootFolderPath, folderData)
    return {"code": CCODES["FOLDERS_CREATED"], "data": {"RepoID" : RepoID, "folderData":folderData}}
  except Exception as e:
    return {"code": CCODES["FAILED_TO_CREATE_FOLDERS"], "data": {"RepoID" : RepoID}, "exception" : {"msg" : str(e), "type" :  str(e.__class__.__name__)}}

TASKS_DEFINITIONS = {
  CCODES["START_GOOGLE_LOGIN"] : startGoogleLogin,
  CCODES["INIT_DIR"] : Init_Dir,
  CCODES["UPLOAD_FILE"]: uploadFile,
  CCODES["GENERATE_IDS"]: generateGDriveID,
  CCODES["RETRIVE_REPO_UPLOADS"] : retriveUploads,
  CCODES["CREATE_FOLDERS"] : createRepoFolders,
  CCODES["DOWNLOAD_FILE"]: downloadFile
}

def addTask(task):
  # TASK_QUEUE.append(TASKS_DEFINITIONS[task.code])

  threading.Thread(target=defaultWrapper,args=[TASKS_DEFINITIONS[task["code"]],task]).start()


def aloneMain():
  DIR_PATH = os.path.abspath("Testing")

  # os.environ["SHOW_NODE_OUTPUT"] = 'sdf'

  task = {
    "data": {"path" : "Testing", "force": True},
    "code": CCODES["INIT_DIR"]
  }

  addTask(task)

def GUI_LAUNCH():
  f = open('test.txt',"w+")
  # MAIN LOOP
  while(True):
    task = sys.stdin.readline()[:-1]
    try:
      task = orjson.loads(task)
      if(task): addTask(task)
    except:
      pass

if(launchArgs.isGUI):
  GUI_LAUNCH()
elif(not launchArgs.isGUI and launchArgs.development):
  aloneMain()
