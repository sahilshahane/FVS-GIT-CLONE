import React, { useReducer } from 'react';
import { Collapse, Progress } from "antd";
const { Panel } = Collapse;

const reducer = (state: any, action: any) => {
  switch(action.type){
    case "updateDownload":
      return {...state, UploadPercent: action.payload};
      break
    case "updateUpload":
      return {...state, DownloadPercent: action.payload};
      break
    case "reset":
      return {UploadPercent: 0, DownloadPercent: 0};
    default:
      return state
  }
}

let temp = Object();

export const updateUploadPercent = (percentDone: number) => {
  temp({type: "updateDownload", payload: percentDone});
}

export const updateDownloadPercent = (percentDone: number) => {
  temp({type: "updateUpload", payload: percentDone});
}

export const resetPercent = () => {
  temp({type: "reset"})
}

const UploadDownloadStatus = () => {
  
  const [state, dispatch] = useReducer(reducer, {DownloadPercent: 0, UploadPercent: 0});
  temp = dispatch;
  return (
    <>
      <div className="contain-collapse">
        <Collapse style={{width: 200}} defaultActiveKey={["1"]} expandIconPosition="right" bordered={false}>
          <Panel header="Check Status" key="1">
            <div id="uploadPercentage">
              <div style={{fontSize: "10px", textAlign: "center"}}>
                <Progress strokeColor="green" type="circle" percent={state.DownloadPercent} width={45} strokeWidth={10} className="uploadCircle" />
                  UPLOADED
              </div>
              <div style={{fontSize: "10px", textAlign: "center"}}>
                <Progress strokeColor="yellow"  type="circle" percent={state.UploadPercent} width={45} strokeWidth={10} className="uploadCircle" />
                DOWNLOADED
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    </>
  )

}
export default UploadDownloadStatus;