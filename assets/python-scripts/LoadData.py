import os,json

def LOAD_COMMUNICATION_CODES(self):
      COMMUNICATION_CODES_FILE_PATH = os.path.join(os.environ["APP_FOLDER_PATH"],"Communication_Codes.json")
      # LOAD THE COMMUNICATION CODES
      with open(COMMUNICATION_CODES_FILE_PATH,"r") as file_:
          CCODES = json.load(file_)

      return CCODES
