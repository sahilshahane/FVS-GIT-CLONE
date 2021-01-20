import sys
import os
import argparse
import orjson

from assets.pythonScripts.log import output
from assets.pythonScripts.LoadData import LOAD_COMMUNICATION_CODES,LOAD_APP_SETTINGS,GET_APP_FOLDER_PATH


args_const = argparse.ArgumentParser()
args_const.add_argument('-dev',"--development",nargs='?', type=str)
args = args_const.parse_args()

APP_FOLDER_PATH = None # APP's Main Folder, Where we are going to store App related Files # APP's Main Folder, Where we are going to store App related Files
CCODES = None # COMMUNICATION CODES
APP_SETTINGS = None # APP SETTINGS

if args.development: os.environ["development"] = True

CCODES = LOAD_COMMUNICATION_CODES()
APP_SETTINGS = LOAD_APP_SETTINGS()
APP_FOLDER_PATH = GET_APP_FOLDER_PATH()


def addTask(task):
  output({"data": task})

while(True):
  task = orjson.loads(sys.stdin.readline()[:-1])
  try:
    if(task): addTask(task)
  except:
    pass
