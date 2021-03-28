import React, { useState, useEffect } from 'react';
import { Input, AutoComplete, Row } from 'antd';
import { renderTitle, renderItem } from './Search_Bar_Components';
import { getResults } from '../modules/Database';
import Reduxstore from '../Redux/store';

const NAV_BAR = () => {
  const [options, setOptions] = useState([]);
  const { UserRepoData } = Reduxstore.getState();
  const RepoIDs: Array<string> = Object.keys(UserRepoData['info']);
  const RepoInfo = UserRepoData['info'];
  let ignrPathString: string = '';

  useEffect(() => {
    for (let repo in RepoInfo) {
      const path = RepoInfo[repo].localLocation;
      ignrPathString += `AND folderPath <> '${path}' `;
    }
  }, []);

  const onSearch = (searchedText: string) => {
    if (searchedText == '') {
      setOptions([]);
    }
    getResults(RepoIDs[0], searchedText, ignrPathString.trim())
      .then((res) => {
        let foundInfo = [...res.folders, ...res.files];
        let options = [];

        for (let repo in RepoInfo) {
          const repoLocation = RepoInfo[repo].localLocation;
          let found = [];

          for (let file of foundInfo) {
            if (file.path.substring(0, repoLocation.length) === repoLocation) {
              file.fileName
                ? found.push(renderItem(file.fileName, file.path, true))
                : found.push(renderItem(file.folderName, file.path, false));
            }
          }

          options.push({
            label: renderTitle(RepoInfo[repo].displayName),
            options: found,
          });
        }

        setOptions(options);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Row>
      <AutoComplete
        dropdownClassName="certain-category-search-dropdown"
        options={options}
        onSearch={onSearch}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <Input.Search
          size="large"
          placeholder="Search File or Folders"
          enterButton
        />
      </AutoComplete>
    </Row>
  );
};

export default NAV_BAR;
