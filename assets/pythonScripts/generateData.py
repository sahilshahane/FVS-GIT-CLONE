import os,time,json
from HashGen import generateHash,generateFileHash


class generateMetaData():
    ignore = None
    totalFiles = 0
    FILE_NAME = None
    FILE_PATH = None
    HASH = None
    APP_DATA_FOLDER = None

    def __init__(self,EXPORT_DIRECTORY,FILE_NAME,APP_DATA_FOLDER,HASH="md5",ignore=None):
        self.FILE_NAME = FILE_NAME
        self.FILE_PATH = os.path.join(EXPORT_DIRECTORY,FILE_NAME)
        self.ignore = ignore
        self.APP_DATA_FOLDER = APP_DATA_FOLDER
        self.HASH = HASH

    def ignoreFunc(self,folderDirectory,fileDirectory=None):
        if self.ignore:
            for ignore in self.ignore:
                if fileDirectory:
                    if("*." in ignore) and fileDirectory.count('.')>0 :
                        fileExtension = fileDirectory[fileDirectory.rindex(".")+1:]
                        if(fileExtension==ignore[2:]):
                            return True
                    elif ignore.endswith("**") & (ignore[:-2] in fileDirectory):
                        return True
                    elif(folderDirectory == ignore) or (fileDirectory == ignore):
                        return True
                else:
                    if ignore.endswith("**") & (ignore[:-2] in folderDirectory):
                        return True
                    elif(folderDirectory == ignore):
                        return True
        return False

    def generate(self,indent=None):
      with open(self.FILE_PATH,'w') as file_:
          file_.write("{")
          for directory,_,files in os.walk('.'):

              if directory.startswith(self.APP_DATA_FOLDER):continue
              if self.ignoreFunc(directory):continue
              # directory = directory if directory=="./" else directory+"/"

              for fileName in files:
                  filePath = os.path.join(directory, fileName)

                  if self.ignoreFunc(directory,filePath): continue

                  DATA = dict()
                  DATA = {
                      filePath : {
                        "fileName":fileName,
                        "hash":generateFileHash(filePath,self.HASH),
                        "parentDir":directory,
                      }
                  }
                  DATA = json.dumps(DATA,indent=indent)[1:-1]

                  file_.write(DATA+",")
                  self.totalFiles+=1
                  yield DATA
                  del(DATA)

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
