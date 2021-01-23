import os,json

import orjson
from HashGen import generateFileHash

class generateMetaData():
    ignore = None
    totalFiles = 0
    totalFolders = 0
    FILE_NAME = None
    FILE_PATH = None
    HASH = None
    DIR_PATH = None

    def __init__(self,DIR_PATH,FILE_NAME,HASH="md5",ignore=None):
        self.FILE_NAME = FILE_NAME
        self.FILE_PATH = os.path.join(DIR_PATH,os.environ["DEFAULT_REPO_DATA_FOLDER_PATH"],FILE_NAME)
        self.ignore = ignore
        self.HASH = HASH
        self.DIR_PATH = DIR_PATH

    def ignoreFunc(self,ParentDirectory,folderName=None,fileName=None):
      if self.ignore:
          for ignore in self.ignore:
              if fileName:
                  filePath = os.path.join(ParentDirectory,fileName)
                  if ignore.startswith("*.") and filePath.rfind('.')>0:
                      fileExtension = filePath[filePath.rindex(".")+1:]
                      if(fileExtension==ignore[2:]):
                          return True
                  elif (filePath==ignore) or (fileName==ignore):
                      return True

              else:
                folderPath = os.path.join(ParentDirectory,folderName)

                if(folderPath == ignore) or (folderName == ignore):
                  return True
                elif ignore.endswith("**") & (ignore[:-2] in ParentDirectory):
                    return True

      return False

    def generate(self,CCODES,indent=None):
      AlternateData = open(os.path.join(self.DIR_PATH,os.environ["DEFAULT_REPO_FOLDER_PATH"],'AlternateData.json'),'w')

      with open(self.FILE_PATH,'w') as file_:
          file_.write("{")
          DATA = dict()
          DirData = dict()

          for directory,folders,files in os.walk(self.DIR_PATH):

              if self.ignoreFunc(directory,folderName=os.path.basename(directory)): continue

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

                  del DATA

                  self.totalFiles+=1

          AlternateData.write(orjson.dumps(DirData).decode('utf-8'))

          self.totalFolders = len(DirData)

          del DirData
          AlternateData.close()

          file_.seek(file_.tell() - 1, os.SEEK_SET)
          file_.write("}")
          file_.close()

    def getInfo(self):
        return {
            "fileName":self.FILE_NAME,
            "filePath":self.FILE_PATH,
            "totalFiles":self.totalFiles,
            "totalFolders":self.totalFolders,
            "fileHash":generateFileHash(self.FILE_PATH),
            "hashType":self.HASH
        }
