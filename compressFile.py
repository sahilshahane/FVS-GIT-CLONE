import lzma
import zipfile
import bz2
import os


class compress():
    fileName = None
    compressionType = None
    compressedFolder = None
    fileDirectory = None
    uspFolder = None
    fileSize = None
    absoluteFilePath = None
    FILE = None
    externalFile = None

    def __init__(self,externalFile,uspFolder="./.usp/",compressedFolder=".compressedFiles/",compressionType="zip"):
        self.externalFile = externalFile
        self.fileName = externalFile["fileName"].replace(".mdfile","")
        self.uspFolder = uspFolder
        self.compressedFolder = compressedFolder + "" if compressedFolder[::-len(compressedFolder)]=="/" else "/"
        self.fileDirectory = self.uspFolder+self.compressedFolder
        self.absoluteFilePath = self.fileDirectory + self.fileName
        self.compressionType = compressionType
        self.checkCommpressedDirectory()
        self.createFile(compressionType)
        self.Convert_ExternalFile_to_CompressedFile()

    def checkCommpressedDirectory(self):
        if(os.path.exists(self.fileDirectory)==False):
            os.mkdir(self.fileDirectory)

    def Convert_ExternalFile_to_CompressedFile(self):
        if(self.compressionType=="zip"):
                self.FILE.write(self.externalFile["absolutePath"])
                self.FILE.close()
        else:
            with open(self.externalFile["absolutePath"],'r') as EXTERNAL_FILE:
                for line in EXTERNAL_FILE:
                    self.FILE.write(line.encode('utf-8'))


    def createFile(self,result):
        try:
            {
            "lzma":self.lzmaCreateFile,
            "zip":self.zipCreateFile,
            "bz2":self.bz2CreateFile
            }[result]()
        except KeyError:
            raise Exception("The specified Compression did not found")
        except FileNotFoundError:
            raise Exception("File Not Found. Directory :",self.fileDirectory)
        

    def lzmaCreateFile(self):
        self.FILE = lzma.LZMAFile(self.absoluteFilePath+".lzma",mode="wb")
    
    def zipCreateFile(self):
        self.FILE = zipfile.ZipFile(self.absoluteFilePath+".zip",mode="w",compression=zipfile.ZIP_BZIP2)

    def bz2CreateFile(self):
        self.FILE = bz2.BZ2File(self.absoluteFilePath+".bz2",mode="wb",compresslevel=1)

    def getInformation(self):
        return {
            "fileName":self.fileName,
            "fileDirectory":self.fileDirectory,
            "fileSize":self.fileSize
        }

