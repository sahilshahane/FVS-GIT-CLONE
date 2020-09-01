import authenticate
import upload
import os

# This contains "folder path" : "its id"


class GDrive():
  service = None
  folderIdDictionary = {}
  fileIdDictionary = {}

  def __init__(self):
    self.service = authenticate.get_gdrive_service()
  

  # This is to upload the Files
  def generateIDmeta(self, folderPath, parentId="", FIRSTTIME=False):
    folderName = os.path.basename(folderPath)
    parentPath = os.path.dirname(folderPath)
    # parentFolderName = (os.path.dirname(folderPath)).split("/")[-1]   #This gives the parent folder name

    if FIRSTTIME:
      for key in self.folderIdDictionary:
        if key == parentPath:
          parentId = self.folderIdDictionary[key]
          break
        else:
          parentId = ""
  
    folderId = upload.createFolder(folderName, parentId, self.service)
    self.folderIdDictionary[folderPath] = folderId
    print(f"Uploaded -> {folderName} folderId -> {folderId} ParentId -> {folderId}")
    return folderId

# To upload the files (NOT THE FIRST TIME)
  def putFiles(self, filePath, parentId=""):

    fileName = os.path.basename(filePath)
    parentPath = os.path.dirname(filePath)
    # parentFolderName = (os.path.dirname(filePath)).split("/")[-1]

    for key in self.folderIdDictionary:
      if key == parentPath:
        parentId = self.folderIdDictionary[key]
      else:
        parentId="" 

    fileId = upload.uploadFile(filePath, parentId)
    self.fileIdDictionary[fileName] =  fileId
    print(f"Uploaded -> {fileName} Fileid -> {fileId} ParentId -> {parentId}")
    return fileId

  def readFolderId(self):
    with open("folderNameId.txt", "r") as f:
      s = (f.readline()).split("<!@#$%>")

      self.folderIdDictionary[s[0]] = s[1][:-1]        # This [-1] is to remove the last "\n"

  #This wont be necessary in future version
  def createMetaFiles(self):

    with open("fileNameId.txt", "w") as f:
      # Here the "key" is not the id bitch dont't get confused (for uttkarsh)
      for key in self.fileIdDictionary:
        f.write(f"{key}<!@#$%>{self.fileIdDictionary[key]}\n")

    with open("folderNameId.txt", "w") as f:
      for key in self.folderIdDictionary:
        f.write(f"{key}<!@#$%>{self.folderIdDictionary[key]}")
  

obj = GDrive()

obj.createFolder("TheFinalTest", "")

# STEPS TO UPLOAD SH!T for the first time
# 
#  1. Call the generateIDmeta method to UPLOAD THE FOLDERS and create the DICTIONARY to with all the FOLDER NAMES and their ID.
#   
#  2. Create a FILE which has the FOLDER PATHS and their IDs by calling the method createMetaFiles().
#
#  3. Now you have the FOLDER IDs, you can upload the FILES to drive by calling the putFiles() method.
#
#  4. Create a FILE which has all the FILE PATHS and their IDs by calling the method createMetaFiles().
#
# 5. Now, you just have to integrate the newly created FILE and FOLDER IDs to the existing files
#

# STEPS TO UPLOAD SH!T not for the first time
# 
#  USE THE readFolderId() to get the dictionary of the FOLDER PATHS and their IDs.  
#
#  CREATING NEW FOLDERS
#   1. Call the generateIDmeta() method without the FIRSTTIME arg as false or ignore it.
#   2. The above step will also add to the dictionary
#
#  CREATING NEW FILES
#   1. Call the putFiles() method 
#   2. This will also add to the dictionary