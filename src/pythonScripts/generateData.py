import os
from sqlite3.dbapi2 import Connection
from HashGen import generateFileHash

class generateMetaData():
    ignore = None
    totalFiles = 0
    totalFolders = 0
    DB_CONNECTION: Connection = None
    DIR_PATH = None
    HASH = None

    def __init__(self,CCODES, DIR_PATH, DB_CONNECTION:Connection ,HASH="md5",ignore=None):
        self.ignore = ignore
        self.DB_CONNECTION = DB_CONNECTION
        self.DIR_PATH = DIR_PATH
        self.HASH = HASH
        self.generate(CCODES)

    def ignoreFunc(self,ParentDirectory,folderName=None,fileName=None):
      uspFolderPath = os.path.join(self.DIR_PATH,os.environ["DEFAULT_REPO_FOLDER_PATH"])

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

                if(folderPath == ignore) or (folderName == ignore) or (not folderPath.find(uspFolderPath)):
                  return True
                elif ignore.endswith("**") & (ignore[:-2] in ParentDirectory):
                    return True

      return False

    def generate(self,CCODES,indent=None):
      DB_CURSOR = self.DB_CONNECTION.cursor()
     
      for directory,folders,files in os.walk(self.DIR_PATH):
        folderName = os.path.basename(directory)

        if self.ignoreFunc(directory,folderName): continue
        
        # FILTER FILES WITH IGNORE DATA [data input = .uspignore file]
        files = [fileName for fileName in files if not (self.ignoreFunc(directory,fileName=fileName))]

        fileQuery = '''INSERT INTO files 

                        (name, 
                        folder_id, 
                        fileHash, 
                        modified_time,
                        downloaded) 

                        VALUES (?,?,?,?,?)
                    '''

        self.totalFolders+=1

        folderQuery = '''INSERT INTO folders 

                          (name,
                            folder_id,
                            parentPath)

                          VALUES (?,?,?)
                      '''

        parentDirPath = os.path.dirname(directory)
        
        # FIX FOR ROOT FOLDER's PARENT NOT SHOWING UP
        # if(not parentDirPath): parentDirPath = directory

        DB_CURSOR.execute(folderQuery,(folderName,self.totalFolders,parentDirPath))
        
        for fileName in files:
          filePath = os.path.join(directory, fileName)
          modified_time = os.path.getmtime(filePath)
          fileHash = generateFileHash(filePath,self.HASH)
          
          DB_CURSOR.execute(fileQuery,(fileName,self.totalFolders,fileHash,modified_time,1))

          self.totalFiles+=1

      DB_CURSOR.close()
      
      self.DB_CONNECTION.commit()

    def getInfo(self):
        return {
          "totalFiles":self.totalFiles,
          "totalFolders":self.totalFolders,
        }
