import argparse
import os
from colorama import Fore
from colorama import Style
from generateData import generateMetaData
from compressFile import compress
from decompressFile import decompress
from HashGen import generateHash,generateFileHash
from mdLog import initLog
from detectChange import detectChange
import time
import shutil
import json
from DrivePart.upload import *
from DrivePart.authenticate import *

# YOU CAN CALCULATE THESE HASHES FOR FILE CHECKING DEFAULT HASH IS "XXH3_64"
# [blake2b, blake2s, md5,
# sha1, sha224, sha256,
# sha384, sha3_224, sha3_256,
# sha3_384,sha3_512, sha512,
# shake_128, shake_256]


# .GDFIDs is a file extention to store Google Drive Folder IDs

class App():
    log = None
    repositoryDirectory = "./" # THE './' REPRESENTS CURRENT REPOSITORY
    uspFolder = ".usp/"
    args = None
    metaDataFileInformation = None
    comMDFile = None
    decomMDFileReport = None
    comMDFileReport = None
    decomMDFileReport = None
    LOG = None
    GD_SERVICE = None
    rootDirectory = None
    repositoryDirName = None
    cacheFolder = None
    
    def __init__(self,args):
        args.add_argument('-init',type=str, help="it initializes the current directory with USP")
        args.add_argument('-commit',type=str, help="it initializes the current directory with USP")
        self.args = args.parse_args()

        temp =  os.getcwd()
        self.repositoryDirName = temp[temp.rindex("/")+1:]
        del(temp)


        self.rootDirectory = os.path.dirname
        self.cacheFolder = {
            "directory":self.repositoryDirectory+self.uspFolder+".cache/",
            "name":".cache/",
        }
        self.initRepository() # AUTOMATICALLY CHECKS EXISTING REPOSITORY AND INITIALIZES IT REPOSITORY [In our Case Testing Folder is our Repository]
    
        self.generateRepositoryReport() # THIS GENERATES METADATA

        self.LOG = initLog(self.uspFolder,logFolder=".log/")

        self.GD_SERVICE = get_gdrive_service()
        
        if(self.tryToDetectChange()==True):
            # self.compressData()
            pass

    def checkRepository(self):
        location = self.uspFolder+"repository.dat"

        if(os.path.exists(location)):
            # raise Exception("The Repository is Already Initialized")
            repositoryFile = open(location,'r')
            repositoryDirectory = repositoryFile.readline()
            repositoryFile.close()
            if(os.path.exists(repositoryDirectory)):
                print(f"{Fore.CYAN}An Existing Repository Exists!{Style.RESET_ALL}")
                self.repositoryDirectory = repositoryDirectory
                return True

        return False

    def initRepository(self):
        if(self.checkRepository()==False):
            print(f"{Fore.CYAN}Initializing New Repository...{Style.RESET_ALL}")

            try: os.mkdir(self.uspFolder)
            except Exception as e: pass

            # self.repositoryDirectory = self.REPOSITORY if self.args.init==None else self.args.init
            repositoryFile = open(self.uspFolder+"/repository.dat",'w')
            repositoryFile.write(self.repositoryDirectory)
            repositoryFile.close()

    def generateRepositoryReport(self):
        self.metaDataFileInformation = generateMetaData(self.repositoryDirectory,self.uspFolder,cacheFolder=self.cacheFolder["name"]).getInformation()
        
    def tryToDetectChange(self):
        previousLogFileInfo = self.LOG.getPreviousCommitInfo()
        latestLogFile = self.LOG.getLatestCommitInfo()

        if(previousLogFileInfo==None) & (latestLogFile==None): # THE FIRST IF BLOCK MEANS IT'S A FIRST COMMIT
            self.firstCommit(self.metaDataFileInformation)
        else:
            previousFileInfo = self.LOG.getFileInfo(latestLogFile)
            changesObj = detectChange(self.metaDataFileInformation,previousFileInfo)

            if(changesObj.changeDetected==True): 
                changes = changesObj.getDetectedChange()
                self.displayChanges(changes)
                self.LOG.commit(self.metaDataFileInformation)
            else:
                print(f"{Fore.RED}No Change Detected! Aborting Commit Changes...{Style.RESET_ALL}")
                self.deleteFile(self.metaDataFileInformation["absolutePath"])
                return False
        
        return True

    def firstCommit(self,metaDataFileInformation):
        self.LOG.commit(metaDataFileInformation)

        # metaDataFileInformation IS THE NEWLY GENERATED META DATA stored in MEMORY which is a dict(),
        # metaDataFileInformation["absolutePath"] contains the Physical File's Location which has MAIN INFORMATION
        mdFile_LOC = metaDataFileInformation["absolutePath"]
        with open(mdFile_LOC,"r") as mdfile:
            foldersData = set()

            # PRE-PROCESS SOME DATA
            for file_ in json.load(mdfile).keys():
                folderPath = file_[:file_.rindex("/")]
                # if(folderPath[0]=="."):
                #     folderPath = self.repositoryDirName+folderPath[1:]
                foldersData.add(folderPath)


        foldersData_asList = list(foldersData)

        failedToCreate = [] # Failed To Create Folders in Drive
        succeedtoCreate = dict() # Successfully Created Folders in Drive

        # CREATE FOLDERS IN GOOGLE DRIVE
        for response,folderPath in createEmptyFoldersInDrive(foldersData_asList,self.repositoryDirName,rootID=None,service=self.GD_SERVICE):
            if response["HttpCode"]!=200:
                failedToCreate.append(folderPath)
                reasontoFail = response["Reason"]
                print(f"{Fore.RED}Failed to Create folder in Drive : {Fore.CYAN}{folderPath}{Style.RESET_ALL} | Reason : {Fore.YELLOW}{reasontoFail}")
            elif response["HttpCode"]==200:
                print(f"{Fore.GREEN}Created folder in Drive : {Fore.CYAN}{folderPath}{Style.RESET_ALL}")
                succeedtoCreate[folderPath] = response["folderID"]

        # SAVE GOOGLE DRIVE FOLDER DATA IN LOCAL STORAGE
        GDFID_LOC = mdFile_LOC+".GDFIDs"
        with open(GDFID_LOC,"w") as GDRIVE_FOLDER_IDs:
            json.dump(succeedtoCreate,GDRIVE_FOLDER_IDs,indent=1)
        
        
        self.uploadFilestoGoogleDrive(mdFile_LOC,GDFID_LOC)

    def displayChanges(self,changes):
        if(changes["NEW_FILES"]):
            print(f"\n{Fore.CYAN}new files :{Style.RESET_ALL}")
            for filePath in changes["NEW_FILES"]:
                print(f"{Fore.GREEN}\t{filePath}{Style.RESET_ALL}")

        if(changes["DELETED_FILES"]):
            print(f"{Fore.CYAN}deleted files :{Style.RESET_ALL}")
            for filePath in changes["DELETED_FILES"]:
                print(f"{Fore.LIGHTRED_EX}\t{filePath}{Style.RESET_ALL}")
        
        if(changes["MODIFIED_FILES"]):
            print(f"{Fore.CYAN}modified files :{Style.RESET_ALL}")
            for filePath in changes["MODIFIED_FILES"]:
                print(f"{Fore.YELLOW}\t{filePath}{Style.RESET_ALL}")

    def compressData(self):
        # YOU CAN CHANGE COMPRESSION TYPE TO [LZMA, ZIP, BZ2] | do not use zip compression for now
        self.comMDFile = compress(self.metaDataFileInformation,self.uspFolder,compressedFolder=".compressedFiles/",compressionType='bz2')
       
    def decompressData(self):
        pass

    def deleteFile(self,filePath):
        os.remove(filePath)

    def uploadFilestoGoogleDrive(self,mdFileLocation,GDFID_LOC):
        with open(mdFileLocation,"r") as mdFile:
            data = json.load(mdFile)
        
        with open(GDFID_LOC,"r") as GDFIDs_FILE:
            GDFIDs = json.load(GDFIDs_FILE)
            for fileLoc,fileData in data.items():
                fileDir = fileData["parentDir"]
                fileName = fileData["fileName"]
                GDRIVE_PARENT_ID = GDFIDs[fileDir]
                uploadFile(fileLoc,GDRIVE_PARENT_ID,fileName=fileName,mimeType=None,service=self.GD_SERVICE)
            
try:
    shutil.rmtree("./.usp/")
except Exception:pass

# for i in range(500):
#     a = open(f"./TestSmall/{time.time_ns()}.temp123","w")
#     a.write("123")
#     a.close()

# start = time.time_ns()

instance = App(argparse.ArgumentParser())

# end = time.time_ns()

# print(f"\n\n{Fore.YELLOW}It took {(end-start)/1e+9} s")
