from os import path
from LoadData import LOAD_COMMUNICATION_CODES
CCODES = LOAD_COMMUNICATION_CODES()

def initDir():
   return {
     "code": CCODES["INIT_DIR"],
     "data":{
     "localPath": path.abspath("Testing"),
     "force": True
     }
   }

def startGoogleLogin():
 return {
      "code": CCODES["START_GOOGLE_LOGIN"]
   }

def checkDriveChanges(repoRootDriveID):
 return {
        "code": CCODES["CHECK_CHANGES"],
        "data": {
            "RepoID": "asdasdasdasd",
            "trackingInfo": {"lastChecked": "2021-03-29T18:11:03.293Z","driveID": repoRootDriveID}
        }
    }

def creatFoldersInDrive(repoRootDriveID = None):
 return {
        "code": CCODES["CREATE_FOLDERS"],
        "data": {
            "RepoID": 'Ai0asjd7wgbn6c38h',

            "repoFolderData": {
                "folder_id": 1,
                "folderPath": 'Testing',
                "driveID": repoRootDriveID,
                "RepoName": 'Testing'
            },
            "folderData": [
                {
                    "folderPath": "Testing/1_TEST_GENERATED",
                    "folder_id": '23r23c4asdasdB761b12'
                },
                {
                    "folderPath": "Testing/1_TEST_GENERATED/NESTED_TEST_GENERATED",
                    "folder_id": '6!UB@&@6#bn@!B761b12'
                },
                {
                    "folderPath": "Testing/2_TEST_GENERATED/1_TEST_GENERATED/NESTED_TEST_GENERATED/NESTED_TEST_GENERATED",
                    "folder_id": '23r23c4asdhasdB761b12'
                },
                
            ]
        }
    }

def checkLocalChanges():
    return {
        "code": CCODES["CHECK_LOCAL_CHANGES"],
        "data": {
            "RepoID": 'Ai0asjd7wgbn6c38h',
            "path": 'Testing'
        }
    }