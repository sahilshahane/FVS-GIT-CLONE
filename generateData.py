import os
import time
import json
from compressFile import compress
from decompressFile import decompress
from HashGen import generateHash,generateFileHash
from colorama import Fore
from colorama import Style

class generateMetaData():
    repositoryDirectory = None
    FILE = None
    ignore = None
    allFolders = set()
    totalFiles = 0
    totalFolders = 0
    cacheFolder = None
    uspFolder = None
    cacheFolder = None
    fileName = None
    fileDirectory = None
    absolutePath = None
    HASH = "xxh3_64"

    def __init__(self,repositoryDirectory,uspFolder=".usp/",cacheFolder=".cache/",ignore=[]):

        self.repositoryDirectory = repositoryDirectory
       
        self.uspFolder = repositoryDirectory+uspFolder

        self.fileDirectory = self.uspFolder + cacheFolder
        self.ignore = ignore
        self.cacheFolder = cacheFolder + "" if cacheFolder[::-len(cacheFolder)]=="/" else "/"
        self.createMDFile()

        # DEFAULT IGNORES
        ignore += [uspFolder,self.repositoryDirectory+"__pycache__",self.repositoryDirectory+".uspignore"]

        self.initIgnore(ignore)
        self.gatherFileData()
        self.totalFolders = len(self.allFolders)
        
    def initIgnore(self,ignore):
        self.ignore = ignore
        if (os.path.exists(self.repositoryDirectory+".uspignore")):
            with open(self.repositoryDirectory+".uspignore",'r') as FILE:
                self.ignore += [line.replace("\n","") for line in FILE.readlines()]
                

    def createMDFile(self):
        self.fileName = str(int(time.time()))+".mdfile"
        if(os.path.exists(self.uspFolder+self.cacheFolder)==False):
            os.mkdir(self.uspFolder+self.cacheFolder)
            # print("Cache Folder Does not Exist")

        self.FILE = open(self.fileDirectory+self.fileName,"w")
        # self.FILE.write("{")
       
    def ignoreFunc(self,folderDirectory,fileDirectory):
        ignore = str
        for ignore in self.ignore:
            if("*." in ignore):
                fileExtension = fileDirectory[fileDirectory.rindex(".")+1:]
                if(fileExtension==ignore[2:]):
                    return True
            elif ignore.endswith("**") & (ignore[:-2] in fileDirectory):
                return True
            elif(folderDirectory == ignore) or (fileDirectory == ignore):
                return True

        return False
        
    def gatherFileData(self):
        # print("Saving Cache Data...")
        DATA = dict()

        for currentDir,folders,files in os.walk(self.repositoryDirectory):

            if self.uspFolder[:-1] in currentDir:
                continue
            
            for fileName in files:
                path = os.path.join(currentDir, fileName)
                # ADD DATA
                
                # DATA[path] = {
                #     "fileName" : fileName,
                #     "hash": generateFileHash(path,self.HASH),
                #     "directory":currentDir,
                # }
                # DATA[path] = generateFileHash(path,self.HASH)

                DATA[path] = {
                    "fileName":fileName,
                    "hash":generateFileHash(path,self.HASH),
                    "parentDir":currentDir if currentDir=="./" else currentDir+"/",
                    "hashType":self.HASH
                }


                self.allFolders.add(currentDir)
                self.totalFiles+=1

        self.totalFiles-=1
            
        try:
            FILTER_DATA = dict()
    
            for absPath,rowData in DATA.items():
                fileName = rowData["fileName"]
                fileHash = rowData["hash"]
                folderDirectory = rowData["parentDir"]+"/"

                ignoreFile = False
                if(self.ignoreFunc(folderDirectory,absPath)):
                    # print(f"{Fore.CYAN}Ignoring : {Fore.YELLOW}{absPath}{Style.RESET_ALL}")
                    continue

                FILTER_DATA[absPath] = rowData

        except Exception as exp:
            print(f"{Fore.RED}Something Went Wrong while Ignoring files, Please check syntax correctly\nError : {exp}{Style.RESET_ALL}")

        json.dump(FILTER_DATA,self.FILE,indent=2)
        
        self.FILE.close()
        self.absolutePath = self.fileDirectory+self.fileName


    def getInformation(self):
        return {
            "fileDirectory":self.fileDirectory,
            "fileName":self.fileName,
            "absolutePath":self.absolutePath,
            "totalFiles":self.totalFiles,
            "totalFolders":self.totalFolders,
            "ignore":self.ignore
        }
        

       
# instance = generateMetaData("./Testing")
