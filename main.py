import argparse
import os

from generateData import generateMetaData
from compressFile import compress
from decompressFile import decompress
from HashGen import generateHash,generateFileHash 
from mdLog import initLog
from detectChange import detectChange

# YOU CAN CALCULATE THESE HASHES FOR FILE CHECKING DEFAULT HASH IS 'MD5'
# [blake2b, blake2s, md5,
# sha1, sha224, sha256,
# sha384, sha3_224, sha3_256,
# sha3_384,sha3_512, sha512,
# shake_128, shake_256]

class App():
    log = None
    repositoryDirectory = None
    uspFolder = "./.usp/"
    args = None
    metaDataFileInformation = None
    comMDFile = None
    decomMDFileReport = None
    comMDFileReport = None
    decomMDFileReport = None
    DEFAULT_REPOSITORY = "./Testing" # THE '.' REPRESENTS CURRENT REPOSITORY
    LOG = None

    def __init__(self,args):
        args.add_argument('-init',type=str, help="it initializes the current directory with USP")
        args.add_argument('-commit',type=str, help="it initializes the current directory with USP")
        self.args = args.parse_args()

        self.beforeStart()

        self.initRepository() # AUTOMATICALLY CHECKS EXISTING REPOSITORY AND INITIALIZES IT REPOSITORY [In our Case Testing Folder is our Repository]
        
        self.LOG = initLog(self.uspFolder,logFolder=".log/")

        self.generateRepositoryReport() # THIS GENERATES METADATA

        if(self.tryToDetectChange()==True):
            self.compressData()



    def beforeStart(self):
        pass

    def checkRepository(self):
        location = self.uspFolder+"repository.dat"

        if(os.path.exists(location)):
            # raise Exception("The Repository is Already Initialized")
            repositoryFile = open(location,'r')
            repositoryDirectory = repositoryFile.readline()
            repositoryFile.close()
            if(repositoryDirectory==self.DEFAULT_REPOSITORY or os.path.exists(repositoryDirectory)):
                print("An Existing Repository Exists!.")
                self.repositoryDirectory = repositoryDirectory
                return True

        return False

    def initRepository(self):
        if(self.checkRepository()==False):
            print("Initializing New Repository...")
            try: os.mkdir(self.uspFolder)
            except Exception as e: pass
            self.repositoryDirectory = self.DEFAULT_REPOSITORY if self.args.init==None else self.args.init
            repositoryFile = open(self.uspFolder+"/repository.dat",'w')
            repositoryFile.write(self.repositoryDirectory)
            repositoryFile.close()

    def generateRepositoryReport(self):
        self.metaDataFileInformation = generateMetaData(self.repositoryDirectory,self.uspFolder,cacheFolder=".cache/").getInformation()
        
    def tryToDetectChange(self):
        previousLogFileInfo = self.LOG.getPreviousCommitInfo()

        if(previousLogFileInfo==None): # THE FIRST IF BLOCK MEANS IT'S A FIRST COMMIT
            self.LOG.commit(self.metaDataFileInformation)
        else:
            previousFileInfo = self.LOG.getFileInfo(previousLogFileInfo)

            if(detectChange(self.metaDataFileInformation,previousFileInfo).changeDetected==True):
                self.LOG.commit(self.metaDataFileInformation)
                print("Changes Detected. Saving Commit...")
            else:
                print("No Change Detected! Aborting Commit Changes...")
                self.deleteFile(self.metaDataFileInformation["absolutePath"])
                return False

        return True


    def compressData(self):
        # YOU CAN CHANGE COMPRESSION TYPE TO [LZMA, ZIP, BZ2] | do not use zip compression for now
        self.comMDFile = compress(self.metaDataFileInformation,self.uspFolder,compressedFolder=".compressedFiles/",compressionType='bz2')
       
    def decompressData(self):
        pass

    def deleteFile(self,filePath):
        os.remove(filePath)

instance = App(argparse.ArgumentParser())
