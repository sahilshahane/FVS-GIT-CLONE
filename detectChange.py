from HashGen import generateHash,generateFileHash
import time
import json

class detectChange():
    changeDetected = None
    previousFilePath = None
    generatedFilePath = None
    HASH = "xxh3_64"
    def __init__(self,generatedFileInfo,previousFilePathInfo):
        self.previousFilePath = previousFilePathInfo["absolutePath"]
        self.generatedFilePath = generatedFileInfo["absolutePath"]
        self.changeDetected = self.detectChange(self.generatedFilePath,self.previousFilePath)

    def detectChange(self,generatedFilePath,previousFilePath):

        G_DATA_HASH = generateFileHash(generatedFilePath,self.HASH)
        P_DATA_HASH = generateFileHash(previousFilePath,self.HASH)
        
        if(G_DATA_HASH==P_DATA_HASH):
            return False

        return True

    def getDetectedChange(self):
        # start = time.time()
        with open(self.generatedFilePath,"r") as FILE:
            newData = json.load(FILE)

        with open(self.previousFilePath,"r") as FILE:
            prevData = json.load(FILE)
        
        # genFileHashes = set(newData.keys())
        # prevFileHashes = set(prevData.keys())
       
        genFileHashes = set(newData.keys())
        prevFileHashes = set(prevData.keys())
        
        NEW_FILES = genFileHashes.difference(prevFileHashes)
        DELETED_FILES = prevFileHashes.difference(genFileHashes)
         
        # cFfilter means common File Hash Filter 
        cFHfilter = genFileHashes - (NEW_FILES | DELETED_FILES) # NEW_FILES | DELETED_FILES means two sets are combined
        
        MODIFIED_FILES = [cHKey for cHKey in cFHfilter if prevData[cHKey]["hash"] != newData[cHKey]["hash"]] #cHKey = Common Hash Key/File

        # end = time.time()
        # print("it took - "+str(end-start))

        return {
            "NEW_FILES":NEW_FILES,
            "DELETED_FILES":DELETED_FILES,
            "MODIFIED_FILES":MODIFIED_FILES
        }

        
        
