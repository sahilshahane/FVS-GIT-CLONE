import os,json
from HashGen import generateFileHash

class generateMetaData():
    ignore = None
    totalFiles = 0
    FILE_NAME = None
    FILE_PATH = None
    HASH = None
    REPOSITORY_PATH = None

    def __init__(self,EXPORT_DIRECTORY,FILE_NAME,REPOSITORY_PATH,HASH="md5",ignore=None):
        self.FILE_NAME = FILE_NAME
        self.FILE_PATH = os.path.join(EXPORT_DIRECTORY,FILE_NAME)
        self.ignore = ignore
        self.REPOSITORY_PATH = os.path.join('.',os.path.normpath(REPOSITORY_PATH))
        self.HASH = HASH

    def ignoreFunc(self,folderDirectory,folderName=None,fileName=None):
      if self.ignore:
          for ignore in self.ignore:
              if fileName:
                  filePath = os.path.join(folderDirectory,fileName)
                  if("*." in ignore) and filePath.count('.')>0 :
                      fileExtension = filePath[filePath.rindex(".")+1:]
                      if(fileExtension==ignore[2:]):
                          return True
                  elif ignore.endswith("**") & (ignore[:-2] in filePath):
                      return True
                  elif (filePath==ignore) or (fileName==ignore) or (fileName == ".uspignore"):
                      return True

              else:
                  if(folderName):
                    folderPath = os.path.join(folderDirectory,folderName)
                    if(folderPath == ignore) or (folderName == ignore) or (folderName in self.REPOSITORY_PATH):
                      return True
                  elif ignore.endswith("**") & (ignore[:-2] in folderDirectory):
                      return True
                  elif (folderDirectory == ignore) or (folderDirectory.startswith(self.REPOSITORY_PATH)):
                      return True

      return False

    def generate(self,RepositoryDirDataFile_,indent=None):
      with open(self.FILE_PATH,'w') as file_:
          file_.write("{")
          DATA = dict()
          DirData = dict()

          for directory,folders,files in os.walk('.'):

              if self.ignoreFunc(directory): continue

              # FILTER FOLDERS WITH IGNORE DATA [data input = .uspignore file]
              folders = [folderName for folderName in folders if not self.ignoreFunc(directory,folderName=folderName)]

              # FILTER FILES WITH IGNORE DATA [data input = .uspignore file]
              files = [fileName for fileName in files if not (self.ignoreFunc(directory,fileName=fileName))]

              DirData[directory] = {"files":files, "folders": folders}

              for fileName in files:
                  filePath = os.path.join(directory, fileName)

                  DATA = {
                      filePath : {
                        "fileName":fileName,
                        "hash":generateFileHash(filePath,self.HASH),
                        "dirLoc":directory,
                      }
                  }


                  DATA = json.dumps(DATA,indent=indent)[1:-1]

                  file_.write(DATA+",")
                  self.totalFiles+=1

                  yield DirData

          json.dump(DirData, RepositoryDirDataFile_)

          del DirData

          file_.seek(file_.tell() - 1, os.SEEK_SET)
          file_.write("}")
          file_.close()

    def getInfo(self):
        return {
            "fileName":self.FILE_NAME,
            "filePath":self.FILE_PATH,
            "totalFiles":self.totalFiles,
            "fileHash":generateFileHash(self.FILE_PATH),
            "hashType":self.HASH
        }
