# SYSTEM IMPORTS
import sys,os,pathlib,time,json,shutil,argparse

from generateData import generateMetaData
from HashGen import generateHash,generateFileHash
from DrivePart.authenticate import get_gdrive_service
from DrivePart.upload import createEmptyFoldersInDrive
from DrivePart.upload import uploadFile

# AVAILABLE HASHES, DEFAULT = md5
# [blake2b, blake2s, md5,
# sha1, sha224, sha256,
# sha384, sha3_224, sha3_256,
# sha3_384,sha3_512, sha512,
# shake_128, shake_256]

# .GDFID is a file extention to store Google Drive Folder IDs

args_const = argparse.ArgumentParser(description='A File Handing System with Multiple Cloud Storage Support, Build for People by Programmers [i know its cringy]')

# CONFIGURATIONS
USER_HOME_PATH = pathlib.Path.home()
APP_FOLDER_PATH = os.path.join(USER_HOME_PATH,".usp")
APP_SETTINGS_PATH = os.path.join(APP_FOLDER_PATH,"Appsetting.json")
COMMUNICATION_CODES_FILE_PATH = os.path.join(APP_FOLDER_PATH,"Communication_Codes.json")
CCODES = None # COMMUNICATION CODES
APP_SETTINGS = None

# IMPORTANT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# DEVELOPMENT ONLY, DISABLE IN PRODUCTION BUILD
try:
    shutil.rmtree(APP_FOLDER_PATH)
except Exception: pass


# AUTOMATICALLY INSTALLS THE REQUIRED FILES
if(os.path.exists(APP_FOLDER_PATH)==False):
    shutil.copytree("assets/installation/.usp",APP_FOLDER_PATH)

# LOAD THE APP SETTINGS / CONFIGURATION
with open(APP_SETTINGS_PATH,"r") as file_:
    APP_SETTINGS = json.load(file_)

# LOAD REPOSITORY SETTINGS
REPOSITORY_PATH = os.path.join(APP_SETTINGS["repository_folderName"])
REPOSITORY_SETTINGS_PATH = os.path.join(REPOSITORY_PATH, APP_SETTINGS["repositorySettings_fileName"])
REPOSITORY_SETTINGS = None
REPOSITORY_LOG_FOLDER_PATH = os.path.join(REPOSITORY_PATH,APP_SETTINGS["log_folderName"])
REPOSITORY_DATA_FOLDER_PATH = os.path.join(REPOSITORY_PATH,APP_SETTINGS["data_folderName"])
COMMIT_FILE_PATH = os.path.join(REPOSITORY_PATH,APP_SETTINGS["repository_commit_fileName"])

# LOAD CLOUD_STORAGE CONFIGURATION, GID_FOLDER_PATH = GOOGLE DRIVE IDs will be stored
REPOSITORY_CLOUD_STORAGE_FOLDER_PATH = os.path.join(REPOSITORY_PATH,APP_SETTINGS["repository_cloudData_folderName"])
GID_FOLDER_PATH = os.path.join(REPOSITORY_CLOUD_STORAGE_FOLDER_PATH, APP_SETTINGS["repository_googleDriveID_folderName"])

# ummmm
def output(_):
    print(json.dumps(_))

# CREATE EMPTY FILES AND FOLDERS
def PRE_initialize_repository():
    if(os.path.exists(REPOSITORY_PATH)):
        return {"code":CCODES["FOLDER_EXISTS"],"msg":"An Existing Repository Folder Already Exist"}

    try:
        os.mkdir(REPOSITORY_PATH)
        os.mkdir(REPOSITORY_DATA_FOLDER_PATH)
        os.mkdir(REPOSITORY_LOG_FOLDER_PATH)
        os.mkdir(REPOSITORY_CLOUD_STORAGE_FOLDER_PATH)
        os.mkdir(GID_FOLDER_PATH)

        with open(REPOSITORY_SETTINGS_PATH,"w") as file_:
            json.dump({'abs_path':os.getcwd()},file_)
            # json.dump({"directory":"./"},file_)

        with open(COMMIT_FILE_PATH,"w") as file_:
            json.dump({"total":0},file_)

    except Exception as e:
        return {"code":CCODES["ERROR"],"msg":e}

    return {"code":CCODES["PRE_INIT"], "msg":"Created Necessary Files and Folders inorder to run the App"}

def commit(MD_FILE_INFO):
    COMMIT = None

    with open(COMMIT_FILE_PATH,"r") as file_:
        COMMIT = json.load(file_)

    # CHECK IF LATEST COMMIT EXIST , IF YES THEN MAKE IT PREVIOUS COMMIT INORDER TO MAKE CURRENT COMMIT the LATEST COMMIT, SRY IF MY GRAMMER IS SAD
    try:
        COMMIT["previous"] += [COMMIT["latest"]]
    except KeyError:
        pass

    createLOG(MD_FILE_INFO=MD_FILE_INFO)

    # UPDATE THE COMMIT DICT
    COMMIT["latest"] = {    "filePath":MD_FILE_INFO["filePath"],
                            "fileName":MD_FILE_INFO["fileName"],
                            "commitTime":str(int(time.time()))
                            }
    COMMIT["total"] += 1

    # WRITE THE LATEST COMMIT IN THE FILE
    with open(COMMIT_FILE_PATH,'w') as file_:
        json.dump(COMMIT,file_)

    output({"code":CCODES["COMMIT_DONE"],"data":COMMIT,"msg":"Commited Data Successfully"})

def createLOG(MD_FILE_INFO):
    FILE_NAME = MD_FILE_INFO["fileName"] + APP_SETTINGS["log_fileExtension"]
    FILE_PATH = os.path.join(REPOSITORY_LOG_FOLDER_PATH,FILE_NAME)
    with open(FILE_PATH,"w") as file_:
        json.dump(MD_FILE_INFO,file_)

    output({"code":CCODES["LOG_CREATED"],"data":{"filePath":FILE_PATH},"msg":"Log Created Successfully"})
    return FILE_PATH

def GEN_MetaData(showOutput=True,indent=None):
    ignores = LOAD_IGNORE_DATA()
    MD_FILE_NAME = str(int(time.time()))+APP_SETTINGS["data_fileExtension"]
    MD_ = generateMetaData( EXPORT_DIRECTORY=REPOSITORY_DATA_FOLDER_PATH,
                            FILE_NAME=MD_FILE_NAME,
                            APP_DATA_FOLDER=REPOSITORY_PATH,
                            HASH="md5",
                            ignore=ignores)
    if showOutput:
        for data in MD_.generate_Optimized():
            output({"code":CCODES["FILE_DATA_CREATED"],"data":data})
    else:
        for _ in MD_.generate_Optimized(): continue

    return MD_.getInfo()

def initialize_repository():
    FILE_INFO = GEN_MetaData()

    commit(MD_FILE_INFO=FILE_INFO)

    output({"code":CCODES["INIT"],"msg":"Repository Initialization Completed"})

def LOAD_REPOSITORY_SETTINGS():
    global REPOSITORY_SETTINGS

    # LOAD REPOSITORY SETTINGS
    with open(REPOSITORY_SETTINGS_PATH,"r") as file_:
            REPOSITORY_SETTINGS = json.load(file_)

    output({"code":CCODES["REPO_SETTINGS_LOAD"],"msg":"Loaded Repository Settings"})

def LOAD_COMMUNICATION_CODES():
    global CCODES

    # LOAD THE COMMUNICATION CODES
    with open(COMMUNICATION_CODES_FILE_PATH,"r") as file_:
        CCODES = json.load(file_)

def INSTALL_REQUIRED_FILES():
    global APP_FOLDER_PATH

    # AUTOMATICALLY INSTALLS THE REQUIRED FILES
    if(os.path.exists(APP_FOLDER_PATH)==False):
        os.mkdir(APP_FOLDER_PATH)
        shutil.copytree("assets/installation",APP_FOLDER_PATH)

        # ALTERNATE COPY, IF ABOVE ONE DOESN'T WORK
        # for dir_,folders_,files_ in os.walk("assets/installation"):
        #     for folder in folders_:
        #         shutil.copytree(os.path.join("assets/installation",folder),APP_FOLDER_PATH)
        #     for file_ in files_:
        #         shutil.copy(os.path.join("assets/installation",file_),APP_FOLDER_PATH)
        #     break

def SET_UP_ARGUMENTS():
    global args_const

    args_const.add_argument('-cd',"--change-directory", metavar='directory', type=str, help='Please Specify a Directory')
    args_const.add_argument('-init',"--initialize", help='Initillizes the Current Working Directory', action="store_true")
    args_const.add_argument('-u',"--update", help='Update the Repository App Data', action="store_true")

def LOAD_IGNORE_DATA():
    IGNORE_FILE_PATH = os.path.join('.',APP_SETTINGS["repository_Ignore_fileName"])
    ignores = APP_SETTINGS["defaultIgnores"]

    if os.path.exists(IGNORE_FILE_PATH):
        file_=  open(IGNORE_FILE_PATH,"r")
        ignores = [line.replace("\n","") for line in file_.readlines()]
        file_.close()

    output({"code":CCODES["IGNORE_DATA_LOAD"],"msg":"Loaded Ignore Settings"})
    return ignores

def Get_latest_commit_info():
    with open(COMMIT_FILE_PATH,"r") as file_:
        COMMIT = json.load(file_)

    return COMMIT["latest"]

def Get_log(FILE_NAME):
    LOG_FILE_PATH = os.path.join(REPOSITORY_LOG_FOLDER_PATH,FILE_NAME+APP_SETTINGS["log_fileExtension"])
    with open(LOG_FILE_PATH,"r") as file_:
        LOG_FILE_INFO = json.load(file_)
    return LOG_FILE_INFO

def LOAD_META_DATA_FILE(FILE_PATH):
    file_ = open(FILE_PATH,'r')
    data = json.load(file_)
    file_.close()
    return data

def update():
    LOAD_REPOSITORY_SETTINGS()

    # GENERATE NEW META DATA
    NEW_FILE_INFO = GEN_MetaData(showOutput=False)

    NEW_FILE_HASH = generateFileHash(NEW_FILE_INFO["filePath"])

    LATEST_COMMIT_FILE = Get_latest_commit_info()

    LATEST_FILE_HASH = Get_log(LATEST_COMMIT_FILE["fileName"])["fileHash"]

    # IF BOTH HASHES ARE SIMILAR THEN REMOVE THE NEW GENERATED META DATA
    if(NEW_FILE_HASH==LATEST_FILE_HASH):
        os.remove(NEW_FILE_INFO["filePath"])
        output({"code":CCODES["NO_CHANGE"],"msg":"No Changes are Detected"})
    else:
        output({"code":CCODES["CHANGE_DETECTED"],"msg":"Changes Detected"})
        # COMMIT FIRST
        commit(MD_FILE_INFO=NEW_FILE_INFO)

        # CHANGES ARE DETECTED, NOW LATEST_COMMIT_FILE BECOMES OLD DATA AND NEWLY GENERATED META DATA BECOMES UPDATED DATA (use NEW_FILE_INFO["filePath"] to get new metadata file path)
        for CHANGES in detectChange(NEW_MD_FILE_PATH=NEW_FILE_INFO["filePath"],OLD_MD_FILE_PATH=LATEST_COMMIT_FILE["filePath"]):
            output(CHANGES)

def detectChange(NEW_MD_FILE_PATH,OLD_MD_FILE_PATH):
    new_Data = LOAD_META_DATA_FILE(NEW_MD_FILE_PATH)
    old_Data = LOAD_META_DATA_FILE(OLD_MD_FILE_PATH)

    new_Data_FILE_PATHS = set(new_Data.keys())
    old_Data_FILE_PATHS = set(old_Data.keys())

    NEW_FILES = new_Data_FILE_PATHS.difference(old_Data_FILE_PATHS)
    DELETED_FILES = old_Data_FILE_PATHS.difference(new_Data_FILE_PATHS)

    del(new_Data_FILE_PATHS)
    del(old_Data_FILE_PATHS)

    cFHfilter = new_Data

    for filePath_ in NEW_FILES:
        cFHfilter = cFHfilter - filePath_
        yield {"code":CCODES["NEW_FILE_DETECTED"],"data":{"filePath":filePath_,"fileName":NEW_FILES[filePath_]["fileName"]}}

    for filePath_ in DELETED_FILES:
        cFHfilter = cFHfilter - filePath_
        yield {"code":CCODES["DELETED_FILE_DETECTED"],"data":{"filePath":filePath_,"fileName":DELETED_FILES[filePath_]["fileName"]}}

    # cFfilter means common File Hash Filter
    # cFHfilter = NEW_FILES - (NEW_FILES | DELETED_FILES) # "NEW_FILES | DELETED_FILES" <--- means two sets are combined

    del(NEW_FILES)
    del(DELETED_FILES)

    # MODIFIED FILES
    for cHKey in cFHfilter:
        if old_Data[cHKey]["hash"] != new_Data[cHKey]["hash"]:
            yield {"code":CCODES["MODIFIED_FILE_DETECTED"],"data":{"filePath":cHKey,"fileName":new_Data[cHKey]["fileName"]}}

    del(cFHfilter)
    del(new_Data)
    del(old_Data)

def initialize():
    result = PRE_initialize_repository()
    if(result["code"]!=CCODES["PRE_INIT"]):
        LOAD_REPOSITORY_SETTINGS()
        output(result)
    else:
        initialize_repository()

def seq_call_args():
    global args_const
    args = args_const.parse_args()

    # CHANGE THE CWD [CURRENT WORKING DIRECTORY] ARGUMENT, ALWAYS SPECIFY THIS ARGUMENT FROM THE ELECTRON APP WHILE SPAWNING
    if(args.change_directory): os.chdir(args.change_directory)
    if(args.initialize): initialize()
    if(args.update):update()



SET_UP_ARGUMENTS()
INSTALL_REQUIRED_FILES()
LOAD_COMMUNICATION_CODES()

seq_call_args()
