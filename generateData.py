import os
import time
import json
from compressFile import compress
from decompressFile import decompress
from HashGen import generateHash,generateFileHash

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

    def __init__(self,repositoryDirectory,uspFolder="./.usp/",cacheFolder=".cache/",ignore=[]):

        self.repositoryDirectory = repositoryDirectory.replace("./","")
        self.fileDirectory = uspFolder + cacheFolder
        self.ignore = ignore
        self.uspFolder = uspFolder
        self.cacheFolder = cacheFolder + "" if cacheFolder[::-len(cacheFolder)]=="/" else "/"
        self.createMDFile()
        self.gatherFileData()
        self.totalFolders = len(self.allFolders)
        

    def createMDFile(self):
        self.fileName = str(int(time.time()))+".mdfile"
        if(os.path.exists(self.uspFolder+self.cacheFolder)==False):
            os.mkdir(self.uspFolder+self.cacheFolder)
            # print("Cache Folder Does not Exist")

        self.FILE = open(self.fileDirectory+self.fileName,"w")
        # self.FILE.write("{")
       
    def gatherFileData(self):
        # print("Saving Cache Data...")

        DATA = dict()

        for currentDir,folders,files in os.walk(self.repositoryDirectory):

            # if(".usp" in currentDir or "__pycache__" in currentDir or "./.git" in currentDir):
            #     continue
          
            for fileName in files:
                if(".py" in fileName):
                    break
                path = os.path.join(currentDir, fileName)
                
                # UNCOMMENT THIS ONLY IF YOU WANT TO ADD MORE THAN 1 FILE PROPERTY DATA
                # fileData = {
                #     "lm":os.path.getmtime(path)
                # }
                # fileData = os.path.getmtime(path)
                # if(self.allFolders.intersection([currentDir])):
                #     filesDict = folderData[currentDir]
                #     filesDict[fileName] = fileData
                #     folderData[currentDir] = filesDict
                # else:
                #     folderData[currentDir] = {fileName:fileData} 


                # METHOD 2
                DATA[path] = generateFileHash(path,"xxh3_64")

                self.allFolders.add(currentDir)
                self.totalFiles+=1


        json.dump(DATA,self.FILE,indent=2)
        
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
