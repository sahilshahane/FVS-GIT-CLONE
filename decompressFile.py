import lzma
import os
import bz2

class decompress():
    fileName = None
    EXTRACTED_DATA = None
    def __init__(self,compressedFileName):
        self.fileName = compressedFileName
        self.EXTRACTED_DATA = self.decompress()
        self.writeExtractedData()

    def decompress(self):
        FILE = bz2.open(self.fileName,"r")
        EXTRACTED_DATA = FILE.read()
        FILE.close()
        return EXTRACTED_DATA
    
    def writeExtractedData(self):
        metaData = open('./.usp/'+'metadata.cache','w')
        metaData.write(self.EXTRACTED_DATA.decode("utf-8"))
        metaData.close()



