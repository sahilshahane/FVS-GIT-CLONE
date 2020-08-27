import authenticate
import upload
import os

# This contains "folder path" : "its id"
folderIdDictionary = {}
fileIdDictionary = {}

class UploadItBoi():
  def __init__(self):
    service = authenticate.get_gdrive_service()
  
  # This is to upload the Files
  def generateIDmeta(self, folderPath, parentId="", FIRSTTIME=False):
    global folderIdDictionary
    folderName = os.path.basename(folderPath)
    parentPath = os.path.dirname(folderPath)
    # parentFolderName = (os.path.dirname(folderPath)).split("/")[-1]   #This gives the parent folder name

    if FIRSTTIME:
      for key in folderIdDictionary:
        if key == parentPath:
          parentId = folderIdDictionary[key]
        else:
          parentId = ""
  
    folderId = upload.createFolder(folderName, parentId)
    folderIdDictionary.__setitem__(folderPath, folderId)
    print(f"Uploaded -> {folderName} folderId -> {folderId} ParentId -> {folderId}")

# To upload the files (NOT THE FIRST TIME)
  def putFiles(self, filePath, parentId=""):
    global folderIdDictionary
    global fileIdDictionary
    fileName = os.path.basename(filePath)
    parentPath = os.path.dirname(filePath)
    # parentFolderName = (os.path.dirname(filePath)).split("/")[-1]

    for key in folderIdDictionary:
      if key == parentPath:
        parentId = folderIdDictionary[key]
      else:
        parentId="" 

    fileId = upload.uploadFile(filePath, parentId)
    fileIdDictionary.__setitem__(fileName, fileId)
    print(f"Uploaded -> {fileName} Fileid -> {fileId} ParentId -> {parentId}")
    return fileId

  def readFolderId(self):
    with open("folderNameId.txt", "r") as f:
      s = (f.readline()).split("<!@#$%>")

      folderIdDictionary.__setitem__(s[0], s[1][:-1])         # This [-1] is to remove the last "\n"

  #This wont be necessary in future version
  def createMetaFiles(self):
    global fileIdDictionary
    global folderIdDictionary

    with open("fileNameId.txt", "w") as f:
      # Here the "key" is not the id bitch dont't get confused (for uttkarsh)
      for key in fileIdDictionary:
        f.write(f"{key}<!@#$%>{fileIdDictionary[key]}\n")

    with open("folderNameId.txt", "w") as f:
      for key in folderIdDictionary:
        f.write(f"{key}<!@#$%>{folderIdDictionary[key]}")
  
uplo = UploadItBoi()

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
