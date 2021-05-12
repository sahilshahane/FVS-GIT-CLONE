# SYSTEM IMPORTS
import os
from sqlite3.dbapi2 import Connection
import time
import types
import orjson
import io
import sqlite3
import shutil
from utils import output
from utils import loadJSON, saveJSON
from generateData import generateMetaData

# AVAILABLE HASHES, DEFAULT = xxh64
# [blake2b, blake2s, md5,
# sha1, sha224, sha256,
# sha384, sha3_224, sha3_256,
# sha3_384,sha3_512, sha512,
# shake_128, shake_256]

def Get_log(DIR_PATH,FILE_NAME):
    LOG_FILE_PATH = os.path.join(DIR_PATH,FILE_NAME,'.json')

    with open(LOG_FILE_PATH,"rb") as file_:
        LOG_FILE_INFO = orjson.loads(file_.read())

    return LOG_FILE_INFO

def Get_latest_commit_info(DIR_PATH):
    COMMIT_FILE_PATH = os.path.join(DIR_PATH,os.environ["DEFAULT_REPO_COMMIT_FILE_PATH"])
    COMMIT = loadJSON(COMMIT_FILE_PATH)
    return COMMIT["latest"]

def createLOG(CCODES,DIR_PATH,MD_FILE_INFO):
    FILE_NAME = MD_FILE_INFO["fileName"] + ".json"
    FILE_PATH = os.path.join(DIR_PATH, os.environ["DEFAULT_REPO_LOG_FOLDER_PATH"], FILE_NAME)

    with open(FILE_PATH,"w") as file_:
        file_.write(orjson.dumps(MD_FILE_INFO).decode('utf-8'))

    output({"code":CCODES["LOG_CREATED"],"data":{"filePath":FILE_PATH},"msg":"Log Created Successfully"})

    return FILE_PATH

def commit(CCODES,DIR_PATH, MD_FILE_INFO):
  COMMIT = None
  COMMIT_FILE_PATH = os.path.join(DIR_PATH,os.environ["DEFAULT_REPO_COMMIT_FILE_PATH"])
  with open(COMMIT_FILE_PATH,"rb") as file_:
      COMMIT = orjson.loads(file_.read())

  # CHECK IF LATEST COMMIT EXIST , IF YES THEN MAKE IT PREVIOUS COMMIT INORDER TO MAKE CURRENT COMMIT the LATEST COMMIT, SRY IF MY GRAMMER IS SAD
  try:
      COMMIT["previous"] += [COMMIT["latest"]]
  except KeyError:
      pass

  # UPDATE THE COMMIT DICT
  COMMIT["latest"] = MD_FILE_INFO

  COMMIT["total"] += 1

  # WRITE THE LATEST COMMIT IN THE FILE
  with open(COMMIT_FILE_PATH,'w') as file_:
      file_.write(orjson.dumps(COMMIT).decode('utf-8'))

  output({"code":CCODES["COMMIT_DONE"],"data":COMMIT,"msg":"Commited Data Successfully"})

def LOAD_IGNORE_DATA(CCODES,APP_SETTINGS,DIR_PATH):

  IGNORE_FILE_PATH_OUTSIDE_REPO = os.path.join(DIR_PATH,".uspignore")
  IGNORE_FILE_PATH_INSIDE_REPO = os.path.join(DIR_PATH,os.environ["DEFAULT_REPO_FOLDER_PATH"],".uspignore")

  ignores = APP_SETTINGS["defaultIgnores"]

  # JUST INCASE
  if not ignores: ignores = []

  # shut the fuck up...sry, my head is paining | it's a generator
  def generate_ignore(path_):
    if os.path.exists(path_):
      file_= open(path_,"r")

      for line in file_.readlines():
        line = os.path.normpath(line.strip())

        if line.startswith("."+os.path.sep):

          if line.endswith(os.path.sep+'**'):
            if not os.path.exists(line[:-2]): line = None
            else: line = os.path.join('.',line)
          else:
            line = os.path.join(DIR_PATH,line[2:])
            if not os.path.exists(line): line = None

        if line: yield line

      file_.close()

  ignores.extend([ignore for ignore in generate_ignore(IGNORE_FILE_PATH_INSIDE_REPO)])
  ignores.extend([ignore for ignore in generate_ignore(IGNORE_FILE_PATH_OUTSIDE_REPO)])
  ignores = list(set(ignores))
  if(ignores): output({"code":CCODES["IGNORE_DATA_LOADED"],"data":ignores,"msg":"Ignore Data Loaded"})
  return ignores

def GENERATE_META_DATA(CCODES,APP_SETTINGS,DIR_PATH,DB_CONNECTION,TYPE:generateMetaData.TYPES):
  ignores = LOAD_IGNORE_DATA(CCODES,APP_SETTINGS,DIR_PATH)
  generateMetaData(CCODES, DIR_PATH, DB_CONNECTION,TYPE, HASH="xxh3_64", ignore=ignores)

def detectChange(CCODES,NEW_MD_FILE_PATH,OLD_MD_FILE_PATH):
  with open(NEW_MD_FILE_PATH,'rb') as file_:
    new_Data = orjson.loads(file_.read())

  with open(OLD_MD_FILE_PATH,'rb') as file_:
    old_Data = orjson.loads(file_.read())

  new_Data_FILE_PATHS = set(new_Data.keys())
  old_Data_FILE_PATHS = set(old_Data.keys())

  NEW_FILES = new_Data_FILE_PATHS.difference(old_Data_FILE_PATHS)
  DELETED_FILES = old_Data_FILE_PATHS.difference(new_Data_FILE_PATHS)

  del old_Data_FILE_PATHS

  # cFfilter means common File Hash Filter
  # cFHfilter = new_Data_FILE_PATHS - (NEW_FILES | DELETED_FILES) # "NEW_FILES | DELETED_FILES" <--- means two sets are combined
  cFHfilter = new_Data_FILE_PATHS - (NEW_FILES | DELETED_FILES)
  del new_Data_FILE_PATHS

  for filePath_ in NEW_FILES:
      yield {"code":CCODES["NEW_FILE_DETECTED"],"data":{"filePath":filePath_,"fileName":new_Data[filePath_]["fileName"]},"msg":"Detected New File"}

  for filePath_ in DELETED_FILES:
      yield {"code":CCODES["DELETED_FILE_DETECTED"],"data":{"filePath":filePath_,"fileName":old_Data[filePath_]["fileName"]},"msg":"Detected Deleted File"}

  del NEW_FILES
  del DELETED_FILES

  # MODIFIED FILES
  for cHKey in cFHfilter:
      if old_Data[cHKey]["hash"] != new_Data[cHKey]["hash"]:
          yield {"code":CCODES["MODIFIED_FILE_DETECTED"],"data":{"filePath":cHKey,"fileName":new_Data[cHKey]["fileName"]},"msg":"Detected Modified File"}

  del cFHfilter
  del new_Data
  del old_Data

def update_locally(CCODES, APP_SETTINGS, DIR_PATH, force=False):

    # GENERATE NEW META DATA
    NEW_FILE_INFO = GEN_MetaData(CCODES,APP_SETTINGS,DIR_PATH)[0]

    # GET THE LATEST COMMIT, BEFORE NEW COMMIT
    LATEST_FILE_INFO = Get_latest_commit_info(DIR_PATH)

    LATEST_FILE_FILE_PATH = os.path.join(LATEST_FILE_INFO["RepositoryPath"],os.environ["DEFAULT_REPO_DATA_FOLDER_PATH"],LATEST_FILE_INFO["fileName"])
    NEW_FILE_FILE_PATH = os.path.join(NEW_FILE_INFO["RepositoryPath"],os.environ["DEFAULT_REPO_DATA_FOLDER_PATH"],NEW_FILE_INFO["fileName"])

    # IF BOTH HASHES ARE SIMILAR THEN REMOVE THE NEW GENERATED META DATA
    if(not force) and (NEW_FILE_INFO["fileHash"] == LATEST_FILE_INFO["fileHash"]):
      output({"code":CCODES["NO_CHANGE"],"msg":"No Changes are Detected"})
      os.remove(NEW_FILE_FILE_PATH)
      NEW_GFID_DATA_FILE_PATH = os.path.join(NEW_FILE_INFO["RepositoryPath"],os.environ["DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH"],NEW_FILE_INFO["fileName"])
      os.remove(NEW_GFID_DATA_FILE_PATH)
    else:
        output({"code":CCODES["CHANGE_DETECTED"],"msg":"Changes Detected"})

        # SAVE NEW COMIT
        commit(CCODES,DIR_PATH,MD_FILE_INFO=NEW_FILE_INFO)

        # CHANGES ARE DETECTED, NOW LATEST_COMMIT_FILE BECOMES OLD DATA AND NEWLY GENERATED META DATA BECOMES UPDATED DATA (use NEW_FILE_INFO["filePath"] to get new metadata file path)
        for CHANGES in detectChange(CCODES,NEW_MD_FILE_PATH=NEW_FILE_FILE_PATH,OLD_MD_FILE_PATH=LATEST_FILE_FILE_PATH):
            output(CHANGES)

def initialize(CCODES, APP_SETTINGS, DIR_PATH, force=False):
  REPO_PATH = os.path.join(DIR_PATH,os.environ["DEFAULT_REPO_FOLDER_PATH"])

  if(force):
    try:
      shutil.rmtree(REPO_PATH)
    except:pass

  # CREATE A DIRECTORY
  os.mkdir(REPO_PATH)

  # CREATE REPOSITORY DATA
  REPO_DATA_PATH = os.path.join(REPO_PATH,os.environ["DEFAULT_REPO_DATA_FILE_NAME"])
  REPO_DATA = dict()
  REPO_DATA["RepoPath"] = DIR_PATH

  saveJSON(REPO_DATA_PATH, REPO_DATA)

  DB_PATH = os.path.join(REPO_PATH,os.environ["DEFAULT_DB_FILE_NAME"])

  DB_CONNECTION = sqlite3.connect(DB_PATH)
  cur = DB_CONNECTION.cursor()

  # FILES TABLE
  cur.execute(f'''CREATE TABLE files (
                      fileName TEXT NOT NULL,
                      folder_id TEXT NOT NULL,
                      modified_time INTEGER,
                      driveID TEXT,
                      uploaded INTEGER,
                      downloaded INTEGER,
                      deleted INTEGER,
                      fileHash TEXT,
                      UNIQUE(fileName,folder_id)
                      )''')

  # FOLDERS TABLE
  cur.execute(f'''CREATE TABLE folders (
                      folderName TEXT NOT NULL,
                      folder_id TEXT NOT NULL,
                      driveID TEXT,
                      folderPath TEXT PRIMARY KEY,
                      UNIQUE(folderName,folder_id)
                    )''')

  cur.execute(f'''CREATE TABLE temp_files (
                      fileName TEXT NOT NULL,
                      folder_id TEXT NOT NULL,
                      modified_time INTEGER,
                      UNIQUE(fileName,folder_id)
                      )''')

  cur.execute(f'''CREATE TABLE temp_folders (
                      folderName TEXT NOT NULL,
                      folder_id TEXT NOT NULL,
                      folderPath TEXT PRIMARY KEY,
                      UNIQUE(folderName,folder_id)
                    )''')

  cur.close()

  DB_CONNECTION.commit()

  # GENERATE DATA
  GENERATE_META_DATA(CCODES,APP_SETTINGS,DIR_PATH, DB_CONNECTION,TYPE=generateMetaData.TYPES.initialize)

def getGFID_FILE_DATA(DIR_PATH : str , fileName : str):
  GFID_FILE_PATH = os.path.join(DIR_PATH, os.environ["DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH"], fileName)
  GFID_FILE = loadJSON(GFID_FILE_PATH)
  return GFID_FILE

def showUploads(CCODES,DIR_PATH, REPO_ID):
    LATEST_COMMIT_INFO = Get_latest_commit_info(DIR_PATH)
    GFID_DATA = getGFID_FILE_DATA(DIR_PATH, fileName=LATEST_COMMIT_INFO["fileName"])

    for parentDirPath in GFID_DATA:
      if GFID_DATA[parentDirPath]["id"]:
        for index in range(len(GFID_DATA[parentDirPath]["files"])):
          if GFID_DATA[parentDirPath]["files"][index]["id"]:
            filePath = os.path.join(parentDirPath,GFID_DATA[parentDirPath]["files"][index]["name"])
            parentID = GFID_DATA[parentDirPath]["id"]
            fileID = GFID_DATA[parentDirPath]["files"][index]["id"]
            output({"code": CCODES["ADD_UPLOAD"],"data":{"RepoId" : REPO_ID,"filePath": filePath, "parentID" : parentID, "driveID" : fileID, "fileName": GFID_DATA[parentDirPath]["files"][index]["name"]}})


def checkLocalChanges(CCODES, APP_SETTINGS, DIR_PATH):
  REPO_PATH = os.path.join(DIR_PATH,os.environ["DEFAULT_REPO_FOLDER_PATH"])
  DB_PATH = os.path.join(REPO_PATH,os.environ["DEFAULT_DB_FILE_NAME"])
  DB_CONNECTION = sqlite3.connect(DB_PATH)

  GENERATE_META_DATA(CCODES, APP_SETTINGS, DIR_PATH,DB_CONNECTION,generateMetaData.TYPES.detect)

  MODIFIED_FILES_QUERY = '''
                          UPDATE files 
                          SET uploaded = NULL,
                          modified_time = temp_files.modified_time 
                          FROM temp_files
                          WHERE files.fileName = temp_files.fileName 
                          AND files.folder_id = temp_files.folder_id 
                          AND temp_files.modified_time > files.modified_time'''

  NEW_FILES_QUERY = '''
                    INSERT INTO files 
                    (fileName,
                    folder_id,
                    modified_time,
                    downloaded) 
						  
                    SELECT 
						  		  temp_files.fileName, 
                          temp_files.folder_id,
                          temp_files.modified_time,
                          1
                          FROM (SELECT temp_files.fileName,
                                temp_files.folder_id 
                                FROM temp_files 
                                EXCEPT 
                                SELECT files.fileName, 
                                files.folder_id FROM files) AS newTable 

                          LEFT JOIN temp_files 
                          ON temp_files.fileName = newTable.fileName 
                          AND temp_files.folder_id = newTable.folder_id  
                          '''
                          
  DELETED_FILES_QUERY = ''' UPDATE files SET deleted = 1 FROM ( 
                                                              SELECT 
                                                              files.fileName,
                                                              files.folder_id
                                                              FROM 
                                                              (
                                                                SELECT 
                                                                fileName, 
                                                                folder_id FROM files 
                                                                  EXCEPT 
                                                                SELECT 
                                                                fileName, 
                                                                folder_id FROM temp_files
                                                              ) AS genTab1 

                                                              LEFT JOIN files 
                                                              ON files.fileName = genTab1.fileName 
                                                              AND files.folder_id = genTab1.folder_id
                                                              WHERE files.deleted IS NULL
                                                          ) AS genTab2 
                            WHERE files.fileName = genTab2.fileName AND files.folder_id = genTab2.folder_id 
                        '''
  
  data = {"FILES":dict(),"FOLDERS":dict()}
  DB_CURSOR = DB_CONNECTION.cursor()

  DB_CURSOR = DB_CURSOR.execute(MODIFIED_FILES_QUERY)
  data["FILES"]["MODIFIED"] = DB_CURSOR.rowcount

  DB_CURSOR.execute(NEW_FILES_QUERY)
  data["FILES"]["NEW"] = DB_CURSOR.rowcount

  DB_CURSOR.execute(DELETED_FILES_QUERY)
  data["FILES"]["DELETED"] = DB_CURSOR.rowcount

  DB_CURSOR.execute("DELETE FROM temp_files").execute("DELETE FROM temp_folders") # CLEAR CURRENT SESSION DATA

  DB_CURSOR.close()
  DB_CONNECTION.commit()

  return data