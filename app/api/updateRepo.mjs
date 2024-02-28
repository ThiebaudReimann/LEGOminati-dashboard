import fetch from 'node-fetch';

export default async function updateGitHubRepository(username, repository, branch, filePath, replaceKey, replaceValue, personalAccessToken) {
  try {
    // Fetch the current details of the file from the repository
    const currentDataResponse = await fetch(`https://api.github.com/repos/${username}/${repository}/contents/${filePath}`, {
      headers: {
        'Authorization': `Bearer ${personalAccessToken}`
      }
    });

    if (!currentDataResponse.ok) {
      throw new Error(`Unable to fetch current details of the file. Status: ${currentDataResponse.status}`);
    }

    const currentData = await currentDataResponse.json();

    // Parse the JSON data
    const parsedData = JSON.parse(Buffer.from(currentData.content, 'base64').toString());

    // Function to replace values in the object
    function replaceValueAtPath(obj, path, value) {
      const keys = path.split('.');

      // Check if `path` consists of only one key to avoid `split`
      if (keys.length === 1) {
        obj[keys[0]] = value;
        return;
      }

      // Otherwise, iteratively navigate through the object
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
    }

    // Replace the value at the specified path position
    replaceValueAtPath(parsedData, replaceKey, replaceValue);

    // Update the file in the repository
    const response = await fetch(`https://api.github.com/repos/${username}/${repository}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${personalAccessToken}`
      },
      body: JSON.stringify({
        message: `Update JSON file: Set ${replaceKey} to ${replaceValue}`,
        content: Buffer.from(JSON.stringify(parsedData, null, 2)).toString('base64'),
        sha: currentData.sha, // SHA-1 Hash of the current file
        branch: branch,
      }),
    });

    if (response.ok) {
      console.log('GitHub Repository erfolgreich aktualisiert.');
    } else {
      console.error('Fehler beim Aktualisieren des GitHub Repository:', await response.text());
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des GitHub Repository:', error.message);
  }
}


/*
const repository = 'LEGOminati';
const branch = 'Website'; // Oder ein anderer Branch-Name
const filePath = 'json/test.json';
const replaceKey = 'lala.name';
const replaceValue = 'Thiébaud';

updateGitHubRepository(repository, branch, filePath, replaceKey, replaceValue);*/