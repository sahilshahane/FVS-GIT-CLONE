import json
import os
import time


class initLog():
    uspFolder = None
    folderDirectory = None
    fileExtension = ".log"
    latestCommit = None
    previousCommitInfo = None
    commitFileLoc = None
    commitFile = None
    totalCommits = None

    def __init__(self, uspFolder, logFolder=".logs/"):
        self.uspFolder = uspFolder
        self.folderDirectory = uspFolder+logFolder
        self.commitFileLoc = uspFolder+"commit"+self.fileExtension
        self.initializeLog()
        
    
    def initializeLog(self):
        if(os.path.exists(self.folderDirectory)==False):
            os.mkdir(self.folderDirectory)
        
        if(os.path.isfile(self.commitFileLoc)==False):
            with open(self.commitFileLoc,"w") as FILE:
                self.commitFile = dict({"totalCommits":0,"previousCommits":dict(),"latest":None})
                json.dump(self.commitFile,FILE,allow_nan=True)
        else:
            with open(self.commitFileLoc,"r") as FILE:
                self.commitFile = json.load(FILE)

        self.totalCommits = self.commitFile["totalCommits"]
            

    def saveCommitInfo(self):
        with open(self.commitFileLoc,"w") as FILE:
            json.dump(self.commitFile,FILE,allow_nan=True)

    def getPreviousCommitInfo(self):
        if(self.totalCommits==0):
            return None
 
        return self.commitFile["latest"]

        
    def getFileInfo(self,logFile):

        with open(logFile["absolutePath"],"r") as FILE:
            return json.load(FILE)

    def commit(self,fileInfo):
        latestCommitLoc = self.folderDirectory+fileInfo["fileName"]+self.fileExtension

        with open(latestCommitLoc,"w") as logFile:
            logFile.write(json.dumps(fileInfo))

        if(self.commitFile["latest"]!=None):
            self.commitFile["previousCommits"].update({self.commitFile["totalCommits"]:self.commitFile["latest"]})

        self.commitFile["latest"] = {
            "absolutePath":latestCommitLoc,
            "commitedOn":time.time()
        }
        self.commitFile["totalCommits"]+=1
        self.saveCommitInfo()

# TEST CASE

# initialize("./").commit({
#      "fileName":"asdasd",
#      "absolutePath":"./test.rtf",
#      "totalFiles":123,
#      "totalFolders":123,
# })
