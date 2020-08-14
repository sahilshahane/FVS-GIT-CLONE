from HashGen import generateHash,generateFileHash
import time
import json

class detectChange():
    changeDetected = None
    previousFilePath = None
    generatedFilePath = None

    def __init__(self,generatedFileInfo,previousFilePathInfo):
        self.previousFilePath = previousFilePathInfo["absolutePath"]
        self.generatedFilePath = generatedFileInfo["absolutePath"]
        self.changeDetected = self.detectChange(self.generatedFilePath,self.previousFilePath)

    def detectChange(self,generatedFilePath,previousFilePath):

        G_DATA_HASH = generateFileHash(generatedFilePath,"xxh3_64")
        P_DATA_HASH = generateFileHash(previousFilePath,"xxh3_64")

        if(G_DATA_HASH==P_DATA_HASH):
            return False

        return True

    def getDetectedChange(self):
        # start = time.time()
        with open(self.generatedFilePath,"r") as FILE:
            newData = json.load(FILE)

        with open(self.previousFilePath,"r") as FILE:
            prevData = json.load(FILE)
        
        genFiles = set(newData.keys())
        prevFiles = set(prevData.keys())

        NEW_FILES = genFiles.difference(prevFiles)
        DELETED_FILES = prevFiles.difference(genFiles)
        # cFfilter means common File Filter 
        cFfilter = set(newData.keys()) - (NEW_FILES | DELETED_FILES) # NEW_FILES | DELETED_FILES means two sets are combined

        MODIFIED_FILES = [cKey for cKey in cFfilter if(prevData[cKey] not in newData[cKey])] #cKey = Common Key/File

        # end = time.time()
        # print("it took - "+str(end-start))

        return {
            "NEW_FILES":NEW_FILES,
            "DELETED_FILES":DELETED_FILES,
            "MODIFIED_FILES":MODIFIED_FILES
        }

        
        
