from HashGen import generateHash,generateFileHash

class detectChange():
    changeDetected = None
    previousFilePath = None
    generatedFilePath = None

    def __init__(self,generatedFileInfo,previousFilePathInfo):
        self.previousFilePath = previousFilePathInfo["absolutePath"]
        self.generatedFilePath = generatedFileInfo["absolutePath"]
        self.changeDetected = self.detectChange(self.generatedFilePath,self.previousFilePath)

        if(self.changeDetected==True):
            self.additionaComputation()

    def detectChange(self,generatedFilePath,previousFilePath):

        G_DATA_HASH = generateFileHash(generatedFilePath,"md5")
        P_DATA_HASH = generateFileHash(previousFilePath,"md5")

        if(G_DATA_HASH==P_DATA_HASH):
            return False

        return True

    def additionaComputation(self):
        pass
        

        
        
