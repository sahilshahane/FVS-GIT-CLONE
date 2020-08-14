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

        if(self.changeDetected==True):
            self.getDetectedChange()

    def detectChange(self,generatedFilePath,previousFilePath):

        G_DATA_HASH = generateFileHash(generatedFilePath,"xxh3_64")
        P_DATA_HASH = generateFileHash(previousFilePath,"xxh3_64")

        if(G_DATA_HASH==P_DATA_HASH):
            return False

        return True

    def getDetectedChange(self):
        start = time.time()

        newFiles = dict()
        deletedFiles = dict()
        modifiedFiles = dict()

        with open(self.generatedFilePath,"r") as FILE:
            newData = json.load(FILE)

        with open(self.previousFilePath,"r") as FILE:
            prevData = json.load(FILE)
        
        genFiles = set(newData.keys())
        prevFiles = set(prevData.keys())

        NEW_FILES = list(genFiles.symmetric_difference(prevFiles))
        DELETED_FILES = list(prevFiles.difference(genFiles))

        print(NEW_FILES)
        print(DELETED_FILES)

        for (nkey,pkey) in newData.keys(),prevData.keys():
            pass



        end = time.time()

        print("it took - "+str(end-start))

        
        
