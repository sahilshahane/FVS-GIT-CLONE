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
       
    def gatherFileData(self):
        print("Saving Cache Data...")
        for currentDir,folders,files in os.walk(self.repositoryDirectory):
            if(".usp" in currentDir):
                continue
            
            for fileName in files:
                path = os.path.join(currentDir, fileName)

                fileData = fileName+","+currentDir+","+str(os.path.getsize(path))+","+str(os.path.getatime(path))+","+str(os.path.getmtime(path))+","+str(os.path.getctime(path))+"\n"

                self.FILE.write(fileData)
                self.allFolders.add(currentDir)
                self.totalFiles+=1

        self.FILE.close()
        self.absolutePath = self.fileDirectory+self.fileName
    # def ignoreFunc(self):
    #     if len(set(file["fileDirectory"].split("/")).intersection(self.ignoreFolder))>0:
    #         return True
    #     return False
    
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