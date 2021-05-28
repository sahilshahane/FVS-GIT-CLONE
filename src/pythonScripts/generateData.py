from enum import Enum
import os
from sqlite3.dbapi2 import Connection
from HashGen import generateHash,generateFileHash

class generateMetaData():
    class TYPES(Enum):
      initialize = 1
      detect = 2

    ignore = None
    totalFiles = 0
    totalFolders = 0
    DB_CONNECTION: Connection = None
    DIR_PATH = None
    HASH = None
    _TYPE:TYPES = None

    def __init__(self,CCODES, DIR_PATH, DB_CONNECTION:Connection,generateType:TYPES,HASH="md5",ignore=None):
        self.ignore = ignore
        self.DB_CONNECTION = DB_CONNECTION
        self.DIR_PATH = os.path.normpath(DIR_PATH)
        self.HASH = HASH
        self._TYPE = generateType
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

    def getQuery(self):
      fileQuery = None
      folderQuery = None

      if(self._TYPE==self.TYPES.initialize):
        
        fileQuery = '''INSERT INTO files

                        (fileName,
                        folder_id,
                        modified_time,
                        downloaded)

                        VALUES (?,?,?,?)
                    '''
        
        folderQuery = '''INSERT INTO folders

                          (folderName,
                            folder_id,
                            folderPath,
                            deleted)

                          VALUES (?,?,?,?)
                      '''

      elif(self._TYPE == self.TYPES.detect):
        self.DB_CONNECTION.cursor().execute("DELETE FROM temp_files").execute("DELETE FROM temp_folders") # CLEAR PREVIOUS SESSION DATA
        fileQuery = '''INSERT INTO temp_files

                        (fileName,
                        folder_id,
                        modified_time)

                        VALUES (?,?,?)
                    '''
        
        folderQuery = '''INSERT INTO temp_folders

                          (folderName,
                            folder_id,
                            folderPath)

                          VALUES (?,?,?)
                      '''

      return fileQuery, folderQuery

    def generate(self,CCODES,indent=None):
      DB_CURSOR = self.DB_CONNECTION.cursor()

      RepoParentDirectoryPath = os.path.normpath(f'{self.DIR_PATH}{os.path.sep}..')
      fileQuery,folderQuery = self.getQuery()
      rootFolderName = os.path.basename(self.DIR_PATH)

      for absoluteDirectoryPath,folders,files in os.walk(self.DIR_PATH):
        folderName = os.path.basename(absoluteDirectoryPath)


        relativeDirectoryPath = rootFolderName + absoluteDirectoryPath[len(self.DIR_PATH):]

        if self.ignoreFunc(relativeDirectoryPath,folderName): continue

        # FILTER FILES WITH IGNORE DATA [data input = .uspignore file]
        files = [fileName for fileName in files if not (self.ignoreFunc(relativeDirectoryPath,fileName=fileName))]

        self.totalFolders+=1

        folderID = generateHash(data=relativeDirectoryPath,hashType="md5")

        # FIX FOR ROOT FOLDER's PARENT NOT SHOWING UP
        # if(not parentDirPath): parentDirPath = directory
        
        if(self._TYPE == self.TYPES.initialize):
          DB_CURSOR.execute(folderQuery,(folderName,folderID,absoluteDirectoryPath,None))
        elif(self._TYPE == self.TYPES.detect):
          DB_CURSOR.execute(folderQuery,(folderName,folderID,absoluteDirectoryPath))

        for fileName in files:
          filePath = os.path.join(absoluteDirectoryPath, fileName)
          modified_time = int(os.path.getmtime(filePath)) * 1000
          # fileHash = generateFileHash(filePath,self.HASH)
          DB_ARGS = None

          if(self._TYPE == self.TYPES.initialize):
            DB_ARGS = (fileName,folderID,modified_time,1)
          elif(self._TYPE == self.TYPES.detect):
            DB_ARGS = (fileName,folderID,modified_time)
            
          DB_CURSOR = DB_CURSOR.execute(fileQuery,DB_ARGS)
          self.totalFiles+=1

      DB_CURSOR.close()
      self.DB_CONNECTION.commit()



    def getInfo(self):
        return {
          "totalFiles":self.totalFiles,
          "totalFolders":self.totalFolders,
        }
